(function($) {

    $.fn.orgChart = function(options) {
        var opts = $.extend(options);
        return new OrgChart($(this), opts);
    }

    // 조직도 기능 만들기
    function OrgChart($container, opts){
        var self = this;
        this.opts = opts;
        var data = [{'id': 1, 'name': '피플아이1', 'parent': 0}];
        this.$container = $container;
        var nodes = {};
        var rootNodes = [];

        // 기존 data를 토대로 노드 나열
        for(var i in data){
            var node = new Node(data[i]);
            nodes[data[i].id] = node;
        }

        // 나열된 노드에 Parent-Child 관계 적용
        for(var i in nodes){
            if(nodes[i].data.parent == 0){
                rootNodes.push(nodes[i]);
            }
            else{
                nodes[nodes[i].data.parent].addChild(nodes[i]);
            }
        }

        // 차트 그리기
        this.draw = function(){
            $container.empty().append(rootNodes[0].render(opts));

            // 내용 텍스트를 클릭했을 때
            $container.find('.node .text').click(function(e){
                var thisId = $(this).parent().parent().attr('node-id');

                // 내용 텍스트 편집 시작
                self.startEdit(thisId);
                e.stopPropagation();
            });


            // 추가 버튼 클릭
            $container.find('.org-add-button').click(function(e){
                var thisId = $(this).parent().parent().attr('node-id');

                // 새로운 노드 만들기
                self.newNode(thisId);
                e.stopPropagation();
            });

            // 삭제 버튼 클릭
            $container.find('.org-del-button').click(function(e){
                var thisId = $(this).parent().parent().attr('node-id');

                // 노드 삭제
                self.deleteNode(thisId);
                e.stopPropagation();
            });
        }

        // 내용 텍스트 편집 시작
        this.startEdit = function(id){

            // input Element를 p Element로 변경하는 함수
            var commitChange = function(){
                var pElement = $('<p class="text">' + nodes[id].data.name + '</p>');
                pElement.click(function(){
                    self.startEdit(id);
                })
                if(inputElement.val() == ''){
                    alert('내용을 입력해주세요');
                    inputElement.focus();
                }else{
                    inputElement.replaceWith(pElement);
                    self.opts.onAddNode(nodes[id]);
                }

            }

            // p Element를 input Element로 변경
            var inputElement = $('<textarea class="org-input" onKeyUp="javascript:check_byte(this,\'26\')">' + nodes[id].data.name + '</textarea>');
            $container.find('div[node-id='+id+'] .text').replaceWith(inputElement);

            // input Element Focus
            inputElement.focus();

            // Enter 누르면 편집 종료
            inputElement.keyup(function(event){
                if(event.which == 13){
                    commitChange();
                }else{
                    nodes[id].data.name = inputElement.val();
                }
            });

            // input Element Blur 했을 때,
            inputElement.blur(function(event){
                commitChange();
            })
        }

        // 새로운 노드 만들기
        this.newNode = function(parentId){

            // 새롭게 만들어지는 노드 id값 생성
            var nextId = Object.keys(nodes).length;
            while(nextId in nodes){
                nextId++;
            }

            // 새롭게 만들어진 노드 추가하기
            self.addNode({id: nextId, name: '', parent: parentId});
        }

        // 새롭게 만들어진 노드 추가하기
        this.addNode = function(data){

            var newNode = new Node(data);
            nodes[data.id] = newNode;
            nodes[data.parent].addChild(newNode);
            self.draw();
            self.startEdit(data.id);
        }

        this.deleteNode = function(id){
            for(var i=0;i<nodes[id].children.length;i++){
                self.deleteNode(nodes[id].children[i].data.id);
            }
            nodes[nodes[id].data.parent].removeChild(id);
            delete nodes[id];
            self.draw();
        }

        $container.addClass('orgChart');
        self.draw();
    }

    // 조직도 구조 만들기
    function Node(data){
        this.data = data;
        this.children = [];

        this.addChild = function(childNode){
            this.children.push(childNode);
        }

        this.removeChild = function(id){
            for(var i=0;i<this.children.length;i++){
                if(this.children[i].data.id == id){
                    this.children.splice(i,1);
                    return;
                }
            }
        }

        // HTML 랜더링
        this.render = function(opts){

            // Child Node의 개수
            var childLength = this.children.length;

            // Parent Node의 Colspan
            var nodeColspan = childLength > 0 ? 2*childLength : 2;

            // Main Table 변수 만들기
            var mainTable = "<table cellpadding='0' cellspacing='0' border='0' style='width: 100%;'>";

            // Sub Table 변수 만들기
            var subTable = "<table cellpadding='0' cellspacing='0' border='0' style='width: 100%;'>" +
                               "<tr class='lines x'>" +
                                   "<td class='line left half'></td>" +
                                   "<td class='line right half'></td>" +
                                "</tr>" +
                            "</table>";

            // Main Table 시작
            mainTable += "<tr>" +
                             "<td colspan='" + nodeColspan + "'>" + this.formatNode(opts) + "</td>" +
                         "</tr>";

            // Parent Node에 근접한 세로선
            if(childLength > 0){
                mainTable += "<tr class='lines'>" +
                                 "<td colspan='" + childLength*2 + "'>" + subTable + "</td>" +
                             "</tr>";
            }

            // 가로선
            var linesCols = '';
            for(var i=0; i<childLength; i++){
                if(childLength==1){
                    linesCols += "<td class='line left half'></td>";
                }else if(i==0){
                    linesCols += "<td class='line left'></td>";
                }else{
                    linesCols += "<td class='line left top'></td>";
                }

                if(childLength==1){
                    linesCols += "<td class='line right half'></td>";
                }else if(i==childLength-1){
                    linesCols += "<td class='line right'></td>";
                }else{
                    linesCols += "<td class='line right top'></td>";
                }
            }

            // Child Node에 근접한 세로선
            mainTable += "<tr class='lines v'>"+linesCols+"</tr>";

            // Child Node 추가
            mainTable += "<tr>";
            for(var i in this.children){
                mainTable += "<td colspan='2'>" + this.children[i].render(opts) + "</td>";
            }
            mainTable += "</tr>";

            // Main Table 태그 닫기
            mainTable += "</table>";

            // 만들어진 Main Table 리턴
            return mainTable;
        }

        // 노드 내부 구조 만들기 [함수]
        this.formatNode = function(opts){
            var name =
                "<div>" +
                    "<p class='text'>" + this.data.name + "</p>" +
                "</div>";

            var add_delete =
                "<div>" +
                    "<div class='org-add-button'><span>ADD</span></div>" +
                    "<div class='org-del-button'><span>DEL</span></div>" +
                "</div>"

            return "<div class='node' node-id='" + this.data.id + "'>" + name + add_delete + "</div>";
        }
    }

})(jQuery);


(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'vs/editor/editor.main'], factory);
    } else {
        factory(jQuery, monaco);
    }
} (function ($, monaco) {

    var obj = {       
        call_canvas_change:true,
        timeout_canvas_change:false,
        editor_height:$('#svg_editor').height(),
        on_canvas_change:function(){
            if(!obj.call_canvas_change) return false;        
            if(obj.timeout_canvas_change) clearTimeout(obj.timeout_canvas_change);
            obj.timeout_canvas_change = setTimeout(function(){
                obj.call_svg_editor_change = false;
                obj.editor_svg.setValue(methodDraw.canvas.getSvgString()); 
                obj.call_svg_editor_change = true;            
            },100)            
            return obj;
        },
        call_svg_editor_change:true,
        timeout_svg_editor_change:false,
        on_svg_editor_change:function(){
            if(!obj.call_svg_editor_change) return false;
            if(obj.timeout_svg_editor_change) clearTimeout(obj.timeout_svg_editor_change);
            obj.timeout_svg_editor_change = setTimeout(function(){
                obj.call_canvas_change = false;
                methodDraw.loadFromString(obj.editor_svg.getValue());
                methodDraw.updateCanvas();
                obj.call_canvas_change = true;
            },1000);
            
            return obj;
        },
        editors_layout:function(){
            if (typeof obj.editor_svg !== 'undefined') {
                obj.editor_svg.layout();
            }
            if (typeof obj.editor_code !== 'undefined') {
                obj.editor_code.layout();
            }                            
            $('#svg_editor').css('width','100%');
        },        
        compiled:false,
        build:function(){
            obj.compiled = [  
                '<center>',
                //obj.editor_svg.getValue(),
                methodDraw.canvas.getSvgString(),
                '</center>',
                '<script>',
                obj.editor_code.getValue(),
                '</script>',                
            ].join('\n');
            return obj;
        },        
        init_method_draw:function(){
            methodDraw.canvas.bind('changed',obj.on_canvas_change);
            return obj;         
        },
        init_monaco:function(){
            obj.editor_svg_el = $('#editor_svg');
            obj.editor_code_el = $('#editor_code');
            if (obj.editor_svg_el.length > 0) {
                    obj.editor_svg = monaco.editor.create(obj.editor_svg_el.get(0), {
                    value: [].join('\n'),
                    theme: 'vs-dark',
                    scrollbar: {
                        useShadows: false,
                        verticalHasArrows: true,
                        horizontalHasArrows: true,
                        verticalScrollbarSize: 17,
                        horizontalScrollbarSize: 17,
                        arrowSize: 30
                    },
                    //wordWrap: 'wordWrapColumn',                    
                    //wordWrapMinified: true,	
                    //wrappingIndent: "indent",                    
                    language: 'html',
                    scrollBeyondLastColumn: 0,
                    scrollBeyondLastLine: true,
                    //showFoldingControls: 'always',
                    //renderWhitespace: 'all',
                    //renderControlCharacters: true
                });
                obj.editor_svg.onDidChangeModelContent(obj.on_svg_editor_change);
            }
            if (obj.editor_code_el.length > 0) {
                    obj.editor_code = monaco.editor.create(obj.editor_code_el.get(0), {
                    value: [
                        'var svg1 = document.getElementById("svg_1");',
                        'if(svg1){',
                        '    var x1 = parseFloat(svg1.getAttribute("x1"));',
                        '    var end_x1 = x1 + 100;',
                        '    var timmer = setInterval(function(){',
                        '        x1+=0.5;',
                        '        if (x1 >= end_x1){',
                        '            clearInterval(timmer);',
                        '            return true;',
                        '        }',
                        '        svg1.setAttribute("x1",x1);',
                        '    },10);',
                        '}',
                    ].join('\n'),
                    theme: 'vs-dark',
                    scrollbar: {
                        useShadows: false,
                        verticalHasArrows: true,
                        horizontalHasArrows: true,
                        verticalScrollbarSize: 17,
                        horizontalScrollbarSize: 17,
                        arrowSize: 30
                    },
                    language: 'javascript',
                    scrollBeyondLastColumn: 0,
                    scrollBeyondLastLine: true,
                    //showFoldingControls: 'always',
                    //renderWhitespace: 'all',
                    //renderControlCharacters: true
                });                
                obj.show_tab('editor_code')
            }
            $(window).on('resize', function(){
                obj.editors_layout();
            });            
            return obj;
        },
        init_tab_bar:function(){
            $('#svg_editor').resizable({
                handles: 's',
                stop: function(event, ui) {
                    obj.editor_height = $(this).height();
                    obj.editors_layout();                  
                }
            });            
            return obj;
        },
        show_preview:function(){            
            obj.build();
            $('#svg_editor').animate({'height':'0px'},300,function(){
                $('#run_code').html('<iframe id="preview_frame" style="width:100%;height:100%;border:none;" />');
                var iframe = document.getElementById('preview_frame');
                iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);
                iframe.document.open();
                iframe.document.write(obj.compiled);
                iframe.document.close();  
                obj.editors_layout();  
            });            
            return obj;
        },        
        show_tab:function(tab){
            $('#run_code').html('');
            $('.vs_button').removeClass('active');  
            $(".vs_button[data-tab='" + tab + "']").addClass('active');
            $('.vs_editor').hide();
            $('#'+tab).show();            
            if(tab ==='run_code'){
                obj.show_preview();
            }
            else {
                $('#svg_editor').animate({'height':obj.editor_height+'px'},300,function(){
                    obj.editors_layout();
                });
            }
            obj.editors_layout();
        },
        init_tabs:function() {
            $('.vs_button').on('click',function(){
                obj.show_tab($(this).data('tab'));
            });
            return obj;
        },
        init:function(){
            window.obj = obj;//Temporary used for debugging, remove this line in production
            return obj.init_monaco()
            .init_tabs()
            .init_tab_bar()
            .init_method_draw()
            .on_canvas_change();
        }
    }

    return {
        init:obj.init,
        layout:obj.editors_layout,
        compiled:obj.compiled
    }
}));
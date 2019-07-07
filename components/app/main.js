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
        on_canvas_change:function(){
            if(!obj.call_canvas_change) return false;
            obj.call_svg_editor_change = false;
            obj.editor_svg.setValue(methodDraw.canvas.getSvgString()); 
            obj.call_svg_editor_change = true;            
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
                    scrollBeyondLastLine: false,
                    //showFoldingControls: 'always',
                    //renderWhitespace: 'all',
                    //renderControlCharacters: true
                });
                obj.editor_svg.onDidChangeModelContent(obj.on_svg_editor_change);
            }
            if (obj.editor_code_el.length > 0) {
                    obj.editor_code = monaco.editor.create(obj.editor_code_el.get(0), {
                    value: [
                        'function x() {',
                        '\tconsole.log("Hello world!");',
                        '}'
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
                    scrollBeyondLastLine: false,
                    showFoldingControls: 'always',
                    renderWhitespace: 'all',
                    renderControlCharacters: true
                });
                obj.editor_code_el.hide();
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
                    obj.editors_layout();
                }
                });            
            return obj;
        },
        init_tabs:function() {
            $('.vs_button').on('click',function(){
                $('.vs_button').removeClass('active');  
                $(this).addClass('active');
                $('.vs_editor').hide();
                $('#'+$(this).data('editor')).show();
                obj.editors_layout();
            });            
            return obj;
        },
        init:function(){
            obj.init_monaco().init_tabs().init_tab_bar().init_method_draw().on_canvas_change();
            window.obj = obj;
            return obj;
        }
    }

    return {
        init:obj.init,
        layout:obj.editors_layout
    }
}));
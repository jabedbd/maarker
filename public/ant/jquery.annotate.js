/// <reference path="jquery-1.2.6-vsdoc.js" />
(function($) {
     var i = 0;
    $.fn.annotateImage = function(options) {

        ///	<summary>
        ///		Creates annotations on the given image.
        ///     Images are loaded from the "getUrl" propety passed into the options.
        ///	</summary>
        var opts = $.extend({}, $.fn.annotateImage.defaults, options);
        var image = this;

        this.image = this;
        this.mode = 'view';

        // Assign defaults
        this.getUrl = opts.getUrl;
        this.saveUrl = opts.saveUrl;
        this.deleteUrl = opts.deleteUrl;
        this.editable = opts.editable;
        this.useAjax = opts.useAjax;
        this.notes = opts.notes;
        i++;
        // Add the canvas
        this.canvas = $('<div class="image-annotate-canvas"><div class="image-annotate-view"></div><div id="point-area" class="image-annotate-point"></div><div id="point-area" class="image-annotate-point-close"></div><div class="image-annotate-edit"><div class="image-annotate-edit-area"></div></div></div>');
        this.canvas.children('.image-annotate-point').show();
        this.canvas.children('.image-annotate-edit').hide();
        this.canvas.children('.image-annotate-view').hide();
       // $('html, body').stop();
        $('#mycanvas').html(this.canvas); 
        $('#mycanvas').stop();
       
       

        // Give the canvas and the container their size and background
        this.canvas.height(this.height());
        this.canvas.width(this.width());
        this.canvas.css('background-image', 'url("' + this.attr('src') + '")');
        this.canvas.children('.image-annotate-view, .image-annotate-edit').height(this.height());
        this.canvas.children('.image-annotate-view, .image-annotate-edit').width(this.width());

        // Add the behavior: hide/show the notes when hovering the picture
        this.canvas.hover(function() {
            if ($(this).children('.image-annotate-edit').css('display') == 'none') {
                $(this).children('.image-annotate-view').show();
            }
        }, function() {
            $(this).children('.image-annotate-view').show();
        });

        this.canvas.children('.image-annotate-view').hover(function() {
            $(this).show();
        }, function() {
            $(this).show();
        });

        // load the notes
        if (this.useAjax) {
            $.fn.annotateImage.ajaxLoad(this);
        } else {
            $.fn.annotateImage.load(this);
        }

        // Add the "Add a note" button
        if (this.editable) {
            //this.button = $('<a class="image-annotate-add" id="image-annotate-add" href="#">Add Note</a>');
            $(".comment").click(function(e) { e.stopPropagation(); });
            $(".antbtn").click(function(e) { e.stopPropagation(); });
            $(".image-annotate-note").click(function(e) { e.stopPropagation(); });
            $(".image-annotate-canvas").click(function() {
                
                $.fn.annotateImage.add(image);
            });
            //this.canvas.after(this.button);
        }

        // Hide the original
        this.hide();

        return this;
    };

    

    
    /**
    * Plugin Defaults
    **/
    $.fn.annotateImage.defaults = {
        getUrl: 'your-get.rails',
        saveUrl: 'your-save.rails',
        deleteUrl: 'your-delete.rails',
        editable: true,
        useAjax: true,
        notes: new Array()
    };

    $.fn.annotateImage.clear = function(image) {
        ///	<summary>
        ///		Clears all existing annotations from the image.
        ///	</summary>    
        for (var i = 0; i < image.notes.length; i++) {
            image.notes[image.notes[i]].destroy();
        }
        image.notes = new Array();
        image.notes = new Array();
    };

    $.fn.annotateImage.ajaxLoad = function(image) {
        ///	<summary>
        ///		Loads the annotations from the "getUrl" property passed in on the
        ///     options object.
        ///	</summary>
        $.getJSON(image.getUrl + '?ticks=' + $.fn.annotateImage.getTicks(), function(data) {
            image.notes = data;
            $.fn.annotateImage.load(image);
        });
    };


    $.fn.annotateImage.load = function(image) {
         //alert(image.toSource());
        ///	<summary>
        ///		Loads the annotations from the notes property passed in on the
        ///     options object.
        ///	</summary>
        for (var i = 0; i < image.notes.length; i++) {
            image.notes[image.notes[i]] = new $.fn.annotateView(image, image.notes[i]);
        }
    };

    $.fn.annotateImage.getTicks = function() {
        ///	<summary>
        ///		Gets a count og the ticks for the current date.
        ///     This is used to ensure that URLs are always unique and not cached by the browser.
        ///	</summary>        
        var now = new Date();
        return now.getTime();
    };

    $.fn.annotateImage.add = function(image) {
        ///	<summary>
        ///		Adds a note to the image.
        ///	</summary>        
        if (image.mode == 'view') {
            image.mode = 'edit';

            // Create/prepare the editable note elements
            var editable = new $.fn.annotateEdit(image);

            $.fn.annotateImage.createSaveButton(editable, image);
            $.fn.annotateImage.createCancelButton(editable, image);
        }
    };

    $.fn.annotateImage.createSaveButton = function(editable, image, note) {
        ///	<summary>
        ///		Creates a Save button on the editable note.
        ///	</summary>
        var ok = $('<a class="image-annotate-edit-ok">Add This Comment</a>');
        //var Reply = $('<a class="image-annotate-edit-open">Reply</a>');
        ok.click(function() {
            var form = $('#image-annotate-edit-form form');
            var text = $('#image-annotate-text').val();
            $.fn.annotateImage.appendPosition(form, editable)
            image.mode = 'view';

            // Save via AJAX
            if (image.useAjax) {
                $.ajax({
                    url: image.saveUrl,
                    data: form.serialize(),
                    error: function(e) { alert("An error occured saving that note.") },
                    success: function(data) {
				if (data.annotation_id != undefined) {
					editable.note.id = data.annotation_id;
				}
		    },
                    dataType: "json"
                });
            }

            // Add to canvas
            if (note) {
                note.resetPosition(editable, text);
            } else {
                editable.note.editable = true;
                note = new $.fn.annotateView(image, editable.note)
                note.resetPosition(editable, text);
                image.notes.push(editable.note);
            }

            editable.destroy();
        });
        editable.form.append(ok); 
        //editable.form.append(Reply);
    };

    $.fn.annotateImage.createCancelButton = function(editable, image) {
        ///	<summary>
        ///		Creates a Cancel button on the editable note.
        ///	</summary>
        var cancel = $('<a class="image-annotate-edit-close cancel-this-comment">x</a>');
        cancel.click(function() {
            editable.destroy();
            image.mode = 'view';
        });
        editable.form.append(cancel);
    };

    $.fn.annotateImage.saveAsHtml = function(image, target) {
        var element = $(target);
        var html = "";
        for (var i = 0; i < image.notes.length; i++) {
            html += $.fn.annotateImage.createHiddenField("text_" + i, image.notes[i].text);
            html += $.fn.annotateImage.createHiddenField("top_" + i, image.notes[i].top);
            html += $.fn.annotateImage.createHiddenField("left_" + i, image.notes[i].left);
            html += $.fn.annotateImage.createHiddenField("height_" + i, image.notes[i].height);
            html += $.fn.annotateImage.createHiddenField("width_" + i, image.notes[i].width);
        }
        element.html(html);
    };

    $.fn.annotateImage.createHiddenField = function(name, value) {
        return '&lt;input type="hidden" name="' + name + '" value="' + value + '" /&gt;<br />';
    };

    var mousex;
    var mousey;
    $(window).load(function() {
   
    $(".frame").on( "mousemove", function( event ) {
        var parentOffset = $(this).offset(); 
        mousex = event.pageX-parentOffset.left-25;
        mousey = event.pageY-parentOffset.top-25;
        //console.log(parentOffset.left);
       //console.log("MouseX"+mousex);
       //console.log("MouseY"+mousey);
});
    
    });
    
    $.fn.annotateEdit = function(image, note) {
        ///	<summary>
        ///		Defines an editable annotation area.
        ///	</summary>
        this.image = image;

        if (note) {
            this.note = note;
        } else {
function uniqueNumber() {
    var date = Date.now();
    
    // If created at same millisecond as previous
    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }
    
    return date;
}

uniqueNumber.previous = 0;
            var id = uniqueNumber();
            var newNote = new Object();
            newNote.id = id;
            newNote.top = mousey;
            newNote.left = mousex;
            newNote.width = 50;
            newNote.height = 50;
            newNote.text = "";
            this.note = newNote;
            //alert(mousex);
        }

        // Set area
        var area = image.canvas.children('.image-annotate-edit').children('.image-annotate-edit-area');
        this.area = area;
        this.area.css('height', this.note.height + 'px');
        this.area.css('width', this.note.width + 'px');
        this.area.css('left', this.note.left + 'px');
        this.area.css('top', this.note.top + 'px');
        // Show the edition canvas and hide the view canvas
        image.canvas.children('.image-annotate-view').hide();
        image.canvas.children('.image-annotate-edit').show();

        // Add the note (which we'll load with the form afterwards)
        var form = $('<div id="image-annotate-edit-form"><form><textarea id="image-annotate-text" placeholder="Write a comment here" name="text" rows="2" cols="20">' + this.note.text + '</textarea></form></div>');
        
        this.form = form;
        $('body').append(this.form);
        this.form.css('left', this.area.offset().left + 'px');
        this.form.css('top', (parseInt(this.area.offset().top) + parseInt(this.area.height()) + 7) + 'px');
    
        
        // Set the area as a draggable/resizable element contained in the image canvas.
        // Would be better to use the containment option for resizable but buggy
        area.resizable({
            handles: 'all',

            stop: function(e, ui) {
                form.css('left', area.offset().left + 'px');
                form.css('top', (parseInt(area.offset().top) + parseInt(area.height()) + 2) + 'px');
            }
        })
        .draggable({
            containment: image.canvas,
            drag: function(e, ui) {
                form.css('left', area.offset().left + 'px');
                form.css('top', (parseInt(area.offset().top) + parseInt(area.height()) + 2) + 'px');
            },
            stop: function(e, ui) {
                form.css('left', area.offset().left + 'px');
                form.css('top', (parseInt(area.offset().top) + parseInt(area.height()) + 2) + 'px');
            }
        });
        return this;
    };

    $.fn.annotateEdit.prototype.destroy = function() {
        ///	<summary>
        ///		Destroys an editable annotation area.
        ///	</summary>        
        this.image.canvas.children('.image-annotate-edit').hide();
        this.area.resizable('destroy');
        this.area.draggable('destroy');
        this.area.css('height', '');
        this.area.css('width', '');
        this.area.css('left', '');
        this.area.css('top', '');
        this.form.remove();
    }

    $.fn.annotateView = function(image, note) {
       
        ///	<summary>
        ///		Defines a annotation area.
        ///	</summary>
        this.image = image;

        this.note = note;
        console.log(note);
        this.editable = (note.editable && image.editable);

        // Add the area
        this.area = $('<div id="ns'+note.id+'" class="image-annotate-area' + (this.editable ? ' image-annotate-area-editable' : '') + '"><div></div></div>');
        this.btn = $('<a id="a'+note.id+'" class="antbtn showthis" href="#a"></a>');
        image.canvas.children('.image-annotate-view').prepend(this.area);
        image.canvas.children('.image-annotate-point').prepend(this.btn);
        
        

        // Add the note
        this.form = $('<div id="ba'+note.id+'" class="image-annotate-note"><a id="s'+note.id+'" class="showmark">Show Marker</a><p>' + note.text + '</p><div class="author">'+note.username+'</div> <div class="replies" id="'+note.id+'"></div><textarea id="r'+ note.id +'" class="comment" placeholder="Type a reply" name="'+ note.id +'"></textarea></div>');
        
        this.form.hide();
        image.canvas.children('.image-annotate-view').append(this.form);
        this.form.children('span.actions').hide();

        // Set the position and size of the note
        this.setPosition();

        // Add the behavior: hide/display the note when hovering the area
        var annotation = this.form;
        var myform = this.form;
        var myborder = this.area;
        myborder.hide();
    this.btn.hover(function() {
            annotation.show();
        }, function() {
         //annotation.hide();
        
     });
        
        myform.hover(function() {
            annotation.show();
        }, function() {
         myborder.hide();
         //annotation.hide();
         
     }); 
        
    $('.showmark').click( function() {
        var showid = $(this).attr('id');
        console.log(showid);
         $('#n'+showid).show();                                  
                        
});
        
        
  
        
        /*
        $('.antbtn').click(function(ev){ 
        var btthisid = $(this).attr('id');
        $("#b"+btthisid).toggle();
            
         
        });
        /*this.area.click(function() {
            var id = $(this).attr('id');
            alert(id);
        });
        Farhan Rizvi
        */
      /*  $('.showthis').click(function(ev){
        
        var btthisid = $(this).attr('id');
        
        $("#b"+btthisid).show();
        $(".closethis").show();
 
            
        });
        
         $('.closethis').click(function(ev){
             
            $(".closethis").hide();
            $("#b"+btthisid).hide(); 
             
         });
        
        */
        
    
        
        

     
        
      /*  $(document).on('click', ".closethis", function() {
            
                     
         $(this).removeClass('closethis');
        $(this).addClass('showthis');   
        $("#b"+btthisid).addClass('hide_comment');
            
        });
        */
        
    
        

    
 function CommentNumber() {
    var date = Date.now();
    
    // If created at same millisecond as previous
    if (date <= CommentNumber.previous) {
        date = ++CommentNumber.previous;
    } else {
        CommentNumber.previous = date;
    }
    
    return date;
}

CommentNumber.previous = 0;   
        
    $('.comment').keyup(function (e) {
 
    if (e.keyCode === 13) {
       if ($(this).is(":focus")) {
     var rid = $(this).attr("name");
     var thisid = $(this).attr("id");
      var myrep = $(this).val();
      var comment = [];
      comment.comment  = myrep;
      comment.note  = note.id;
      comment.comid  = CommentNumber();
      var cevent = new CustomEvent('onAnReply', {detail: comment});
      document.dispatchEvent(cevent);  
      $(this).val('');
    }
   }
  }); 
    
        
  

        
        // Edit a note feature
        if (this.editable) {
            var form = this;
           this.area.click(function() {
                form.edit();
            });
        }
    };

    
 
    $.fn.annotateView.prototype.setPosition = function() {
        ///	<summary>
        ///		Sets the position of an annotation.
        ///	</summary>
        this.area.children('div').height((parseInt(this.note.height) - 2) + 'px');
        this.area.children('div').width((parseInt(this.note.width) - 2) + 'px');
        this.area.css('left', (this.note.left) + 'px');
        this.area.css('top', (this.note.top) + 'px');
        this.form.css('left', (this.note.left) + 'px');
        this.form.css('top', (parseInt(this.note.top) + parseInt(this.note.height) + 7) + 'px');
        var vheight = parseInt(this.note.height);
        this.btn.css('left', (this.note.left) + 'px');
        this.btn.css('top', (this.note.top + vheight) + 'px');

    };

    $.fn.annotateView.prototype.show = function() {
        ///	<summary>
        ///		Highlights the annotation
        ///	</summary>
        this.form.fadeIn(250);
        if (!this.editable) {
            this.area.addClass('image-annotate-area-hover');
        } else {
            this.area.addClass('image-annotate-area-editable-hover');
        }
    };

    $.fn.annotateView.prototype.hide = function() {
        ///	<summary>
        ///		Removes the highlight from the annotation.
        ///	</summary>      
        this.form.fadeOut(250);
        this.area.removeClass('image-annotate-area-hover');
        this.area.removeClass('image-annotate-area-editable-hover');
    };

    $.fn.annotateView.prototype.destroy = function() {
        ///	<summary>
        ///		Destroys the annotation.
        ///	</summary>      
        this.area.remove();
        this.form.remove();
    }

    $.fn.annotateView.prototype.edit = function() {
        ///	<summary>
        ///		Edits the annotation.
        ///	</summary>      
        if (this.image.mode == 'view') {
            this.image.mode = 'edit';
            var annotation = this;

            // Create/prepare the editable note elements
            var editable = new $.fn.annotateEdit(this.image, this.note);

            $.fn.annotateImage.createSaveButton(editable, this.image, annotation);

            // Add the delete button
            var del = $('<a class="image-annotate-edit-delete">Delete</a>');
            del.click(function() {
                var form = $('#image-annotate-edit-form form');

                $.fn.annotateImage.appendPosition(form, editable)

                if (annotation.image.useAjax) {
                    $.ajax({
                        url: annotation.image.deleteUrl,
                        data: form.serialize(),
                        error: function(e) { alert("An error occured deleting that note.") }
                    });
                }

                annotation.image.mode = 'view';
                editable.destroy();
                annotation.destroy();
            });
            editable.form.append(del);

            $.fn.annotateImage.createCancelButton(editable, this.image);
        }
    };

    $.fn.annotateImage.appendPosition = function(form, editable) {
        
        ///	<summary>
        ///		Appends the annotations coordinates to the given form that is posted to the server.
        ///	</summary>
        var areaFields = $('<input type="hidden" value="' + editable.area.height() + '" name="height"/>' +
                           '<input type="hidden" value="' + editable.area.width() + '" name="width"/>' +
                           '<input type="hidden" value="' + editable.area.position().top + '" name="top"/>' +
                           '<input type="hidden" value="' + editable.area.position().left + '" name="left"/>' +
                           '<input type="hidden" value="' + editable.note.id + '" name="id"/>');
        form.append(areaFields);
    }
    
    
    function fireEvent(element,event){
if (document.createEventObject){
// dispatch for IE
var evt = document.createEventObject();
return element.fireEvent('on'+event,evt)
}
else{
// dispatch for firefox + others
var evt = document.createEvent("HTMLEvents");
evt.initEvent(event, true, true ); // event type,bubbling,cancelable
return !element.dispatchEvent(evt);
}
}

    $.fn.annotateView.prototype.resetPosition = function(editable, text) {

        ///	<summary>
        ///		Sets the position of an annotation.
        ///	</summary>
        this.form.html(text);
        this.form.hide();

        // Resize
        this.area.children('div').height(editable.area.height() + 'px');
        this.area.children('div').width((editable.area.width() - 2) + 'px');
        this.area.css('left', (editable.area.position().left) + 'px');
        this.area.css('top', (editable.area.position().top) + 'px');
        this.form.css('left', (editable.area.position().left) + 'px');
        this.form.css('top', (parseInt(editable.area.position().top) + parseInt(editable.area.height()) + 7) + 'px');

        // Save new position to note
        this.note.top = editable.area.position().top;
        this.note.left = editable.area.position().left;
        this.note.height = editable.area.height();
        this.note.width = editable.area.width();
        this.note.text = text;
        this.note.id = editable.note.id;
        this.editable = true;
        var data = this.note;
        var event = new CustomEvent('onAnChange', {detail: data});
        document.dispatchEvent(event);
    };

})(jQuery);
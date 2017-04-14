jQuery(function ($) {
window.onload = function() {
    var mainpath = window.location.pathname;
    var pid = mainpath.replace("/project/", "");
    
	var messages = [];
	var newmessages = [];
	var socket = io.connect('http://192.168.0.201:3700');
	var field = document.getElementById("field");
	var sendButton = document.getElementById("send");
	var content = document.getElementById("data");
	var name = document.getElementById("name");
	var room = pid;
    var thesrc = document.getElementById("projimg").src;
    
	socket.on('connect', function() {
 
		// Connect to Room
		socket.emit('room', room);
	});
var co = 0;
	socket.on('message', function (data) {
     
		if(data.message != "test") {
			messages.push(data);
			var html = '';
            var mynotes = []; 
            $.each( data, function( key, value ) {
             mynotes.push(value.notes);
});
co++;

   $("#projimg").annotateImage({
      editable: true,
      useAjax: false,
      notes: mynotes,
    }); 
      
    
		} else {
        
			console.log("There is a problem:", data.message);
		}
	});

    
    
socket.on('newmessage', function (data) {
     
		if(data.message != "test") {
			var html = '';
            var newnotes = [];
$.each( data, function( key, value ) {
              newnotes.push(value.notes);
});     
    /*        
$("#projimg").annotateImage({
      editable: true,
      useAjax: false,
      notes: data.notes,
    }); 
    */
            

          
		} else {
			console.log("There is a problem:", data.message);
		}
	});
    
 // Reply Update   
socket.on('updatereply', function (data) {
    if(data.comment != '') {
          $("#"+data.noteid).append("<div class='new-reply'><p id="+data.comid+">"+data.comment+"</p><div id='repby' class='repby-author'> "+data.username+"</div></div>");
        
    }
  
    
});

    
//OnLoadReplyUpdate

socket.on('replyfromdb', function (data) {
   
    
   $.each( data, function( key, value ) {
        $("#"+value.noteid).append("<div class='new-reply'><p id="+value.comid+">"+value.comment+"</p><div id='repby' class='repby-author'> "+value.username+"</div></div>");
    });                    
                              
                               

    
    
});
  

   socket.emit('mminit', {thesrc:room });
    
    
    document.addEventListener("onAnChange", function(data){
          
              if(name.value == "") {
			alert("Nickname required.");
		}
        else {
            
          // alert(annotation.toSource());
   
            var notes = data.detail;
            var aid = data.detail.id;
            var projid = room;
            notes.username = name.value;
            var username = name.value;
			socket.emit('send', {notes:notes, thesrc:projid, username: username, aid: aid});
            
        }
                              
});
    
    
  document.addEventListener("onAnReply", function(data){
      var noteid = data.detail.note;
      var comment = data.detail.comment;
      var comid = data.detail.comid;
      var username = name.value;
      if(comment != ''){
          socket.emit('reply', {noteid:noteid, projectid:room, username: username, comid: comid, comment: comment});
      }
    });
    
    
    /* function datafunction(notes) {
        alert(notes.toSource());
          if(name.value == "") {
			alert("Nickname required.");
		}
        else {
            
          // alert(annotation.toSource());
   
            var notes = notes;
            var aid = notes.id;
            var projid = room;
            var username = name.value;
			socket.emit('send', {notes:notes, thesrc:projid, username: username, aid: aid});
            
        }
}

*/
    
    
/* anno.addHandler('onPopupShown', function(annotation) {  

$("#rreply").on('keyup', function (e) {
    if (e.keyCode == 13) {
       
            if(name.value == "") {
			alert("Nickname required.");
		}
        else {
            
            var myrep = $('#rreply').val();
            annotation.replies =  myrep;
            var comidd = annotation.antid;
            var text = annotation.text;
            var  shapes = annotation.shapes;
            var  replies = annotation.replies;
            var projid = room;
			 socket.emit('update', {replies: myrep, comid: comidd, shapes: shapes, projid: projid, text: text });
            
        }  
        
    }
});
    
});
*/

    
    
$('#edit_btn').click(function(){
 var pname = $("#ptitle").html();
 $("#ptitle").html('<input type="text" id="new_title">');
$("#new_title").val(pname);
 $("#save_this").show();
$('#edit_btn').hide();
    
    
});
    
$('#save_this').click(function(){
var newtitle  = $('#new_title').val();
 socket.emit('edit_title', {newtitle:newtitle, projectid:room});
 $("#ptitle").html(newtitle);
  $("#save_this").hide();
$('#edit_btn').show();  
});
    
}

});
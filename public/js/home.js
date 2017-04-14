window.onload = function() {
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
            $uploadedImg[0].style.backgroundImage='url('+e.target.result+')';
    };

    reader.readAsDataURL(input.files[0]);
      
      return 
  }
}

var $form = $("#imageUploadForm"), 
    $file = $("#file"), 
    $uploadedImg = $("#uploadedImg"), 
    $helpText = $("#helpText")
;
$file.on('change', function(){
 var url = readURL(this);
  $form.addClass('loading');

var files = $(this).get(0).files;
var formData = new FormData();

 for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }

$.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
 $(location).attr('href', '/project/'+data);
     
      }
        
});
    

    
});
$uploadedImg.on('webkitAnimationEnd MSAnimationEnd oAnimationEnd animationend', function(){
  $form.addClass('loaded');
});
$helpText.on('webkitAnimationEnd MSAnimationEnd oAnimationEnd animationend', function(){
  setTimeout(function() {
    $file.val('');  $form.removeClass('loading').removeClass('loaded');
  }, 5000);
});
    
}



$(document).ready(function(){
    console.log("Loaded!");
    $ ("#exist").click(function(){
        $("#userLogin").empty();
        console.log("you clicked exist");
        var htmlString = createContent(1);
        $('#userLogin').append(htmlString);
    });
    $ ("#new").click(function(){
        $("#userLogin").empty();
        console.log("you clicked new");
        var htmlString = createContent(2);
        $('#userLogin').append(htmlString);
    });
    $('#go').click(function(){
        var curName = $('#userInput').val();
        document.location.href = '/' + curName;
    });

});

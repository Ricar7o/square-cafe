// alert("Javascript is loaded.");
// =============== FUNCTIONS ===================
function serverIsDown() {
  $('.panel h2').text('Our server is having difficulties, please try again...');
  $('input').removeAttr("disabled");
}

function assembleOrder(arrayOfItems) {
  orderHTML = "<div><ol>";
  for (i=0; i < JSON.parse(arrayOfItems).length; i++) {
    if (JSON.parse(arrayOfItems)[i]["name"] == "Please select a drink") continue;
    orderHTML += "<li>" + JSON.parse(arrayOfItems)[i]["name"] + "<//li>";
  }
  orderHTML += "</ol></div>";
  return orderHTML;
}

function loadImage(selectedItem) {
  $('#picture img').attr('src', selectedItem.val() + ".jpg");
}

function submitEmail() {
  d = $("#email-form").serialize();
  $.ajax({
    type: "POST",
    url: "/signup",
    data: d,
    success: function(data) {
      $("#modal p").text(data);
      createCookie("email", $("#modal-email").val(), 1);
      setTimeout(function(){
        $("#modal").dialog("close");
      }, 500);
    },
    error: function(data) {
      $("#modal p").text(data); // This is the part that handles the error being down
    },
    dataType: "html"
  });
}

function createCookie(name, value, expires, path, domain) {
  var cookie = name + "=" + escape(value) + ";";
  if (expires) {
    // If it's a date
    if (expires instanceof Date) {
      // If it isn't a valid date
      if (isNaN(expires.getTime()))
        expires = new Date();
    }
    else
      expires = new Date(new Date().getTime() + parseInt(expires)*1000*60*60*24);
    cookie += "expires=" + expires.toGMTString() + ";";
  }
  if (path)
    cookie += "path=" + path + ";";
  if (domain)
    cookie += "domain=" + domain + ";";
  document.cookie = cookie;
}

function getCookie(name) {
  var regexp = new RegExp("(?:^" + name + "|;\\s*"+ name + ")=(.*?)(?:;|$)", "g");
  var result = regexp.exec(document.cookie);
  return (result === null) ? null : result[1];
}

// =============== DOCUMENT IS READY ===================
$(document).ready(function() {
  $("input[type=submit]").attr("disabled", "disabled");
  
  if (getCookie("email")) {
    $(".panel h2").prepend(getCookie("email") + ", ");
  }
  else {
    $("#modal").dialog({
      modal: true,
      width: 400,
      height: 180,
      hide: "fade"
    });
  }

  $(".ui-widget-overlay").click(function(){
    $("#modal").dialog("close");
  });

  $("#modal-email").keyup(function(event) {
    if(event.keyCode == 13) {
      submitEmail();
    }
  })

  $("#modal-submit").click(function(){
    submitEmail();
  });

  // --------- Adding drinks to order ---------
  $('#drink-order').on('change', 'select', function() {
    // If I set the item to 'Please select your coffee', I want to get rid of it.
    if ((this).value == "Please select a drink"){
      $(this).empty();
      $(this).parent().remove();
    }
    // ---------------------------

    // Load the picture of the selected item
    loadImage($("option:selected",this));
    
    // -----------------------------------

    // Count the number of select elements in the page that have no drink selected
    empty_select_elements = 0;
    $("select").each(function (index, element) {
      if (element.value == "Please select a drink")
        empty_select_elements += 1;
    });
    // ----------------------------

    // Count the number of drinks
    number_of_drinks = $("select").length;
    $('#drinks').text(number_of_drinks);
    // --------------------------

    // Calculate the total of the order
    total = 0; // Total invoice in cents
    $("option:selected[data-price]").each(function(){
        total += parseInt($(this).attr('data-price'));
    });
    $("#cost").text("$ " + (total/100.0).toFixed(2));
    $("input[type=submit]").removeAttr("disabled");
    // ----------------------------------

    // If there are multiple select elements in the page, clone the select element
    if (empty_select_elements < 1) {
      dropdown_element_html = $('form div').first().html(); // get the HTML code from the div inside the from
      // $('form').append('<div>' + dropdown_element_html + '</div>');
      $('<div>' + dropdown_element_html + '</div>').insertAfter('form div:last'); // This inserts the div right after the last one, not at the end of the panel.
    };
    // --------------------------------------

    //Change the tax calculations
    $('#taxes').load('/taxes', $('form').serialize());
    // --------------------------
    
  });

  // ------- Submit logic ----------
  $("#drink-order").submit(function(event) {
    event.preventDefault();
    $("input").attr("disabled", "disabled");
    //Change the tax calculations
    $('#taxes').load('/taxes', $('form').serialize());
    
    d = $("form").serialize();

    // Server request
    $.ajax({
      type: "POST",
      url: "/shop",
      data: d,
      success: function(data) {
        $("div.panel h2").text("Your order is being processed...");
        $("div.panel form div").remove();
        $("div.panel form").prepend(assembleOrder(data));
      },
      error: function(data) {
        serverIsDown(); // This is the part that handles the error being down
      },
      dataType: "html"
    });
    // -----------------------------
  });

  
});

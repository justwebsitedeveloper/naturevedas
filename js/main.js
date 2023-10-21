var isEmptyOrSpaces = function (str) {
  return str === null || str.match(/^ *$/) !== null;
};

// Form Handlers
var formManager = (function () {
  var itemsCount = {};

  var isPositiveInteger = function (n) {
    return n >>> 0 === parseFloat(n);
  };

  var updateItemCount = function (key, value) {
    if (itemsCount[key]) {
      itemsCount[key] += parseFloat(value);
    } else {
      itemsCount[key] = parseFloat(value);
    }
  };

  return {
    updateItems: function () {
      var update = true;
      itemsCount = {};

      $('.item-row').each(function () {
        var item = $(this);
        itemName = item.find('.item-indi').val();
        quantity = item.find('.item-quantity').val();
        if (!isEmptyOrSpaces(itemName) && isPositiveInteger(quantity)) {
          updateItemCount(itemName, quantity);
        } else {
          isEmptyOrSpaces(itemName)
            ? alert('Please select input in all fields')
            : alert('Please enter a valid quiantity for ' + itemName);
          itemsCount = {};
          update = false;
          return false;
        }
      });

      if (update) {
        formUiManager.updateUiOnClose(itemsCount);
        $('#items-modal').modal('hide');
        setTimeout(function () {
          $('#quote-modal').modal('show');
        }, 1000);
      }
    },

    getItems: function () {
      return itemsCount;
    },

    reset: function () {
      itemsCount = {};
      formUiManager.updateUiOnClose(itemsCount);
      formUiManager.resetForm();
    },
  };
})();

var formUiManager = (function () {
  var domStrings = {
    elementList: '.form_element_list',
    addItem: 'add_item',
    removeItem: '.remove-item',
    calculate: 'calculate_items',
    itemListing: 'items-listing',
    itemModalClose: '.close-items-modal',
  };

  var itemsList = ['Wooden Cutlery', 'Eco-Friendly bag'];

  var select = function () {
    html =
      "<div class='col-8'><select name='item' class='item-indi custom-select'>";
    html += "<option value=''>Select Item</option>";
    $.each(itemsList, function (index, item) {
      html += '<option value="' + item + '">' + item + '</option>';
    });
    html += '</select></div>';
    html +=
      "<div class='col-2 p-0'><input type='text' class='form-control number-input item-quantity' name='quantity' placeholder='Qty'></div>";
    return html;
  };

  var createList = function (obj) {
    var output = '';
    for (key in obj) {
      output += '<li>' + key + ' - ' + obj[key] + '</li>';
    }
    return output;
  };

  var removeItemEventListener = function (event) {
    event.target.parentNode.parentNode.remove();
    // removeItem(event.target);
  };

  return {
    getDomStrings: function () {
      return domStrings;
    },

    createInitail: function () {
      var outerDiv = document.querySelector(domStrings.elementList);
      var innerDiv = document.createElement('div');
      innerDiv.classList.add('item-row', 'row', 'mb-3');
      innerDiv.innerHTML = select();
      outerDiv.appendChild(innerDiv);
    },

    createAdditional: function () {
      var outerDiv = document.querySelector(domStrings.elementList);
      var innerDiv = document.createElement('div');
      innerDiv.classList.add('item-row', 'row', 'mb-3', 'align-items-center');
      innerDiv.innerHTML =
        select() +
        "<div class='col-1 p-0'><button type='button' class='btn btn-clear remove-item text-danger font-weight-bold'>&times;</button></div>";
      outerDiv.appendChild(innerDiv);
    },

    removeItem: function (evTraget) {
      evTraget.parentNode.parentNode.remove();
    },

    updateUiOnClose: function (obj) {
      var counter = Object.keys(obj).length;
      var ele = $(domStrings.elementList);

      document.querySelector(domStrings.elementList).innerHTML = '';
      if (obj != {}) {
        this.createInitail();
        for (i = 0; i < counter - 1; i++) {
          this.createAdditional();
        }
      }

      count = 0;
      for (key in obj) {
        var row = ele.find('.item-row:eq(' + count + ')');
        row.find('select').val(key);
        row.find('input').val(obj[key]);
        count++;
      }

      document.getElementById(domStrings.itemListing).innerHTML = createList(
        obj
      );
      document.querySelectorAll(domStrings.removeItem).forEach((item) => {
        item.addEventListener('click', removeItemEventListener);
      });

      if (jQuery.isEmptyObject(formManager.getItems())) {
        $('#list-error').html('Please add Items to your list.');
      } else {
        $('#list-error').html('');
      }
    },

    itemModalClose: function () {
      this.updateUiOnClose(formManager.getItems());
      $('#items-modal').modal('hide');
      setTimeout(function () {
        $('#quote-modal').modal('show');
      }, 1000);
    },

    resetForm: function () {
      $('#quote-form').trigger('reset');
    },
  };
})();

var formController = (function (formManager, formUi) {
  var dom = formUi.getDomStrings();

  var initalizeEventListeners = function () {
    document.getElementById(dom.addItem).addEventListener('click', ctrlAddItem);
    document
      .getElementById(dom.calculate)
      .addEventListener('click', calculateItem);
    document
      .querySelector(dom.itemModalClose)
      .addEventListener('click', terminateItemModal);
  };

  var ctrlAddItem = function () {
    formUi.createAdditional();
    document.querySelectorAll(dom.removeItem).forEach((item) => {
      item.addEventListener('click', ctrlRemoveItem);
    });
  };

  var ctrlRemoveItem = function (event) {
    formUi.removeItem(event.target);
  };

  var calculateItem = function () {
    formManager.updateItems();
  };

  var terminateItemModal = function () {
    formUi.itemModalClose();
  };

  return {
    init: function () {
      formUi.createInitail();
      initalizeEventListeners();
    },

    resetForm: function () {
      formManager.reset();
    },
  };
})(formManager, formUiManager);


// Form Submission

$(document).ready(function () {

  if ($('#quote-form')) {
    formController.init();
  }

  $('#quote-form').validate({
    ignore: ':hidden',
    rules: {
      name: {
        required: true,
        minlength: 3,
      },
      email: {
        required: true,
        email: true,
      },
      phone: {
        required: true,
        minlength: 10,
        maxlength: 10,
      },
      message: {
        required: false,
        maxlength: 700,
      },
    },
    messages: {
      name: {
        required: 'This Field is required',
        minlength: "C'mon full name please.",
      },
      email: 'Enter a valid email.',
      phone: {
        required: 'This Field is required',
        minlength: 'The phone number must have 10 digits',
        maxlength: 'The phone number must have 10 digits',
      },
      message: {
        required: 'What did you want to say?',
        minlength: 'Please complete your thoughts, then submit.',
      },
    },
    submitHandler: function (form) {
      $('#get-quote-submission').prop('disabled', true);
      $('.overlay').addClass('active');
      if (jQuery.isEmptyObject(formManager.getItems())) {
        $('#list-error').html('Please add Items to your list.');
        return false;
      }

      var form = $('#quote-form');
      var action = form.attr('action');
      var data = {
        name: $('#name').val(),
        email: $('#email').val(),
        phone: $('#phone').val(),
        items: formManager.getItems(),
        message: $('#message').val(),
      };

      $.ajax({
        type: 'POST',
        url: action,
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
          if (data.status === 'success') {
            formManager.reset();
            $('#get-quote-submission').prop('disabled', false);
            $('#quote-modal').modal('hide');
            setTimeout(function () {
              $('.overlay').removeClass('active');
              $('#successModal').modal('show');
            }, 1000);
          } else {
            alert('Something went wrong. Please try again later');
            $('.overlay').removeClass('active');
            $('#get-quote-submission').prop('disabled', false);
          }
        },
        error: function (errMsg) {
          alert('Something went wrong. Please try again later');
          $('.overlay').removeClass('active');
          $('#get-quote-submission').prop('disabled', false);
        },
      });
      return false;
    },
  });
});

//Allow only Number input in number fields
// Restricts input for the set of matched elements to the given inputFilter function.
(function ($) {
  $.fn.inputFilter = function (inputFilter) {
    return this.on(
      'input keydown keyup mousedown mouseup select contextmenu drop',
      function () {
        if (inputFilter(this.value)) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty('oldValue')) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        } else {
          this.value = '';
        }
      }
    );
  };
})(jQuery);

$(document).ready(function () {
  $('.number-input').inputFilter(function (value) {
    return /^\d*$/.test(value); // Allow digits only, using a RegExp
  });
});

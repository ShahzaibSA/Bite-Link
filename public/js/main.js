// console.clear();
const showMessage = function (msg, msgType) {
  let color, icon;
  if (msgType == 'success') {
    color = '#6efc64';
    icon = 'checked.png';
  } else if (msgType == 'error') {
    color = '#ff6b61';
    icon = 'error.png';
  } else {
    color = '#ffe670';
    icon = 'default.png';
  }
  var msgDiv = `
      <div
          style='background-color: ${color}; '
          class="container mb-2 alert alert-dismissible fade show"
          role="alert"
          >
          <img src="/assets/img/${icon}" alt="${icon}">
          <strong class="text-dark p-1">&nbsp${msg}</strong>
          <button
              style='color: #234f1e; outline: none; margin-top: 2px;'
              type="button"
              class="close"
              data-dismiss="alert"
              aria-label="Close"
          >
              <span aria-hidden="true">&times;</span>
          </button>
      </div>
    `;
  $('.message-div').empty().append(msgDiv);
  $('.message-div')
    .fadeTo(2500, 500)
    .slideUp(500, function () {
      $('#message-div').slideUp(500);
    });
};

const validateUrl = function (url) {
  const urlRegex =
    /^(https?|ftp):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
  if (!urlRegex.test(url)) {
    return false;
  } else {
    return true;
  }
};

const spinner = {
  start: function () {
    $('.spinner-div').removeClass('d-none');
    $('.spinner-div').addClass('spinner-border');
  },
  stop: function () {
    $('.spinner-div').addClass('d-none');
    $('.spinner-div').removeClass('spinner-border');
  }
};

//! AJAX REQUEST

$('.register-form').on('submit', function (e) {
  e.preventDefault();
  spinner.start();
  $.ajax({
    type: 'POST',
    url: '/users',
    data: $('form').serialize(),
    success: function (result) {
      spinner.stop();
      showMessage('Your Account Sccessfully Created!', 'success');
      setTimeout(() => {
        window.location.href = result.redirectUrl;
      }, 2500);
    },
    error: function (error) {
      spinner.stop();

      var errorMsg = error.responseText ? JSON.parse(error.responseText) : '';
      if (errorMsg?.errors?.password) {
        errorMsg = errorMsg.errors.password.message;
      } else if (errorMsg?.code || errorMsg?.errors?.email) {
        errorMsg = errorMsg.code
          ? 'Email already exists!'
          : 'Email is not valid!';
      } else {
        errorMsg = 'Something went wrong!';
      }
      showMessage(errorMsg, 'error');
    }
  });
});

$('.login-form').on('submit', function (e) {
  e.preventDefault();
  spinner.start();
  $.ajax({
    type: 'POST',
    url: '/users/login',
    data: $('form').serialize(),
    success: function (result) {
      spinner.stop();
      showMessage('Login Succesfully!', 'success');
      setTimeout(() => {
        window.location.href = result.redirectUrl;
      }, 2500);
    },
    error: function (error) {
      spinner.stop();
      showMessage(error.responseJSON?.error, 'error');
    }
  });
});

$('.logout-btn').click(function () {
  $.ajax({
    type: 'POST',
    url: '/users/logout',
    success: function (result) {
      window.location.href = result.redirectUrl;
    },
    error: function (error) {
      showMessage(error, 'error');
    }
  });
});

$('.url-form').on('submit', function (e) {
  e.preventDefault();
  if (!validateUrl($('input[name="url"]').val())) {
    return showMessage('Error: Url is not valid!', 'error');
  }
  $.ajax({
    type: 'POST',
    url: '/url',
    data: $('form').serialize(),
    success: function (result) {
      if (result.id) {
        const link = window.location.href + 'url/' + result.id;
        const urlDiv = `
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <button class="input-group-text" id="basic-addon3">
                  Here's short URL
                </button>
              </div>
              <span class="form-control" id="short-url-link">${link}</span>
              <button
                type="button"
                style="padding: 5px"
                onclick="copyToClipboard()"
                class="copy-to-clipboard btn btn-primary btn-sm"
              >
                Copy Link
              </button>
            </div>
          `;
        $('.short-url-div').empty().append(urlDiv);
        showMessage('Your short link successfully generated.', 'success');
      }
    },
    error: function (error) {
      showMessage(error, 'error');
      // $('#page-top').html(error);
    }
  });
});

$('.analytics-form').on('submit', function (e) {
  e.preventDefault();
  // if (!validateUrl($('input[name="url"]').val())) {
  //   return showMessage('Error: Url is not valid!', 'error');
  // }
  $.ajax({
    type: 'GET',
    url: '/url/analytics',
    data: {
      url: $('input[name="url"]').val()
    },
    success: function (result) {
      $('.analytics-data-div').css('display', 'block');
      $('.table-body').empty();
      result.clickHistory?.forEach((history, index) => {
        $('.total-clicks')
          .empty()
          .append(index + 1);
        $('.table-body').append(`
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${history.date}</td>
          <td>${history.ipAddress}</td>
          <td>${result.redirectUrl}</td>
        </tr>
      `);
      });
    },
    error: function (error) {
      $('.analytics-data-div').css('display', 'none');
      $('.table-body').empty();
      showMessage(error.responseJSON?.msg, 'error');
    }
  });
});

$('.close').click(function () {
  $('.show').remove();
});

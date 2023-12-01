// console.clear();
var SECRET_KEY = '@cce$$T0ken$ecretKey@1996';

const copyToClipboard = function () {
  const copyText = document.getElementById('short-url-link');
  // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.innerText);

  // Alert the copied text
  showMessage('Your short link copied!', 'success');
};

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

const setAccessToken = function (at) {
  const encryptedToken = CryptoJS.AES.encrypt(at, SECRET_KEY).toString();
  localStorage.setItem('accessToken', encryptedToken);
};

const getAccessToken = function () {
  const encryptedToken = localStorage.getItem('accessToken');
  const decryptedToken = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  return decryptedToken;
};

const deleteAccessToken = () => localStorage.clear();

const getNewAccessToken = function () {
  return Promise.resolve(
    $.ajax({
      type: 'POST',
      url: '/refresh',
      success: function (result) {
        setAccessToken(result.accessToken);
        return result.accessToken;
      },
      error: function (error) {
        return error;
      }
    })
  );
};

const setReqHeader = (xhr) => xhr.setRequestHeader('Authorization', 'Bearer ' + getAccessToken());

const showNewGeneratedUrl = function (result) {
  const link = window.location.href + 'url/' + result.id;
  const urlDiv = `
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <button class="input-group-text" id="basic-addon3">
                  Here's short URL
                </button>
              </div>
              <a class="form-control" id="short-url-link" data-toggle="tooltip" data-placement="top"
                title="Click to open in new tab" href="${link}" target="_blank">${link}</a>
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
};

//! AJAX REQUEST

$('.register-form').on('submit', function (e) {
  e.preventDefault();
  if ($('#pass').val().toLowerCase().includes('password')) {
    return showMessage('Password cannot contain "password"', 'error');
  } else if ($('#pass').val().length < 7) {
    return showMessage('Password must be minimum 5 characters!', 'error');
  }
  $('input[type="submit"]').attr('disabled', 'disabled');
  spinner.start();
  $.ajax({
    type: 'POST',
    url: '/users',
    data: $('form').serialize(),
    success: function (result) {
      spinner.stop();
      $('input[type="submit"]').removeAttr('disabled', 'disabled');
      showMessage('Your Account Sccessfully Created!', 'success');
      setTimeout(() => {
        window.location.href = result.redirectUrl;
      }, 2500);
    },
    error: function (error) {
      spinner.stop();
      $('input[type="submit"]').removeAttr('disabled', 'disabled');
      var errorMsg = error.responseText ? JSON.parse(error.responseText) : '';
      if (errorMsg?.errors?.password) {
        errorMsg = errorMsg.errors.password.message;
      } else if (errorMsg?.code || errorMsg?.errors?.email) {
        errorMsg = errorMsg.code ? 'Email already exists!' : 'Email is not valid!';
      } else {
        errorMsg = 'Something went wrong! Please try again later.';
      }
      showMessage(errorMsg, 'error');
    }
  });
});

$('.login-form').on('submit', function (e) {
  e.preventDefault();
  $('input[type="submit"]').attr('disabled', 'disabled');
  spinner.start();
  $.ajax({
    type: 'POST',
    url: '/users/login',
    data: $('form').serialize(),
    success: function (result) {
      spinner.stop();
      $('input[type="submit"]').removeAttr('disabled', 'disabled');
      showMessage('Login Succesfully!', 'success');
      setAccessToken(result.accessToken);
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    },
    error: function (error) {
      spinner.stop();
      $('input[type="submit"]').removeAttr('disabled', 'disabled');
      showMessage(error.responseJSON?.error, 'error');
    }
  });
});

$('.logout-btn').click(function () {
  spinner.start();
  $.ajax({
    type: 'POST',
    url: '/users/logout',
    beforeSend: setReqHeader,
    success: function (result) {
      spinner.stop();
      location.replace(result.redirectUrl);
    },
    error: async function (error) {
      spinner.stop();
      if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
        try {
          const newAccessToken = await getNewAccessToken();
          if (!newAccessToken) return location.replace('/login');
          $.ajax({
            type: 'POST',
            url: '/users/logout',
            beforeSend: setReqHeader,
            success: function (result) {
              location.replace(result.redirectUrl);
            }
          });
        } catch (error) {
          showMessage('Session Expired!', 'error');
          setTimeout(() => {
            location.replace('/login');
          }, 2500);
        }
      } else {
        showMessage(error, 'error');
      }
    }
  }).done(() => deleteAccessToken());
});

$('.url-form').on('submit', function (e) {
  e.preventDefault();
  if (!validateUrl($('input[name="url"]').val())) {
    return showMessage('Error: Url is not valid!', 'error');
  }
  $('button[type="submit"]').attr('disabled', true);
  spinner.start();
  $.ajax({
    type: 'POST',
    url: '/url',
    beforeSend: setReqHeader,
    data: $('form').serialize(),
    success: function (result) {
      $('button[type="submit"]').removeAttr('disabled');
      spinner.stop();
      showNewGeneratedUrl(result);
    },
    error: async function (error) {
      $('button[type="submit"]').removeAttr('disabled');
      spinner.stop();
      if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
        try {
          const newAccessToken = await getNewAccessToken();
          if (!newAccessToken) return location.replace('/login');
          $.ajax({
            type: 'POST',
            url: '/url',
            data: $('form').serialize(),
            beforeSend: setReqHeader,
            success: function (result) {
              showNewGeneratedUrl(result);
            }
          });
        } catch (error) {
          showMessage('Session Expired!', 'error');
          setTimeout(() => {
            location.replace('/login');
          }, 2500);
        }
      } else {
        showMessage(error, 'error');
      }
    }
  });
});

$('.analytics-form').on('submit', function (e) {
  e.preventDefault();
  // if (!validateUrl($('input[name="url"]').val())) {
  //   return showMessage('Url is not valid!', 'error');
  // }
  const id = $('input[name="url"]').val().split('/url/')[1];
  if (!id) return showMessage('Please valid url!');
  $('button[type="submit"]').attr('disabled', true);
  spinner.start();
  $.ajax({
    type: 'GET',
    url: '/url/analytics',
    data: { id },
    beforeSend: setReqHeader,
    success: function (result) {
      $('button[type="submit"]').removeAttr('disabled');
      spinner.stop();
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
    error: async function (error) {
      $('button[type="submit"]').removeAttr('disabled');
      spinner.stop();
      if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
        const newAccessToken = await getNewAccessToken();
        if (!newAccessToken) return location.replace('/login');
        $('.analytics-data-div').css('display', 'none');
        $('.table-body', '.total-clicks').empty();
        return showMessage('Please Try Again!');
      }
      $('.analytics-data-div').css('display', 'none');
      $('.table-body', '.total-clicks').empty();
      showMessage(error.responseJSON?.error, 'error');
    }
  });
});

$('.close').click(function () {
  $('.show').remove();
});

'use strict';

var SECRET_KEY = '@cce$$T0ken$ecretKey@1996';

$(window).on('load', function () {
  $('.link').each((i, el) => {
    const shortId = $('input[name=shortId]')[i].defaultValue;
    const url = `${window.location.origin}/url/${shortId}`;
    el.href = url;
    el.innerText = url;
  });
});

$('body').on('click', function (e) {
  const shortId = e.target?.nextSibling?.nextSibling?.defaultValue;
  if (shortId) {
    const linkEl = $(`.short-id-${shortId}`);
    const href = linkEl[0]?.href;
    if (href) {
      linkEl.addClass('text-primary').text('Link Copied');
      navigator.clipboard.writeText(href);
      setTimeout(() => {
        linkEl.removeClass('text-primary').text(href);
      }, 2000);
    }
  }
});

// $('.edit-link-btn').on('click', function (e) {
//   const urlDataRow = $(e.target).parent().siblings('td');
//   if (urlDataRow) {
//     const shortId = urlDataRow[0].children[0].children[0].querySelector('input').value;
//     const redirectUrl = urlDataRow[1].children[0].innerText;
//     const status = urlDataRow[3].children[0].innerText?.toLowerCase();
//     const shortIdInputHtml = `<input id='urlShortId' type="hidden" value="${shortId}">`;
//     $('#shortIdInputDiv').empty().append(shortIdInputHtml);
//     $('#url').val(redirectUrl);

//     const selected = $('#linkStatus > option[selected=selected]');
//     if (selected) $(selected).removeAttr('selected');

//     const opt = $(`option[value=${status}]`)[0];
//     $(opt).attr('selected', 'selected');
//   }
// });

$('.edit-link-btn').on('click', function (e) {
  const urlDataRow = $(e.target).parent().siblings('td');
  if (urlDataRow) {
    const shortId = urlDataRow.find('input').val();
    const redirectUrl = urlDataRow.eq(1).text();
    const status = urlDataRow.eq(3).find('span').text().toLowerCase();
    const shortIdInputHtml = `<input id='urlShortId' type="hidden" value="${shortId}">`;
    $('#shortIdInputDiv').html(shortIdInputHtml);
    $('#url').val(redirectUrl);

    $('#linkStatus option').removeAttr('selected');
    $(`#linkStatus option[value=${status}]`).attr('selected', 'selected');
  }
});

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
    color = '#3b95ee';
    icon = 'default.png';
  }
  var msgDiv = `
      <div
          style='background-color: ${color}; '
          class="container mb-2 alert alert-dismissible fade show"
          role="alert"
          >
          <img src="/assets/img/${icon}" alt="${icon}">
          <strong class="p-1" style="color: black;">&nbsp${msg}</strong>
      </div>
    `;
  const msgDivClass = $('.modal').hasClass('show') ? '.modal-msg-div' : '.message-div';
  $(msgDivClass).empty().append(msgDiv);
  $(msgDivClass)
    .fadeTo(2500, 500)
    .slideUp(500, function () {
      $(msgDivClass).slideUp(500);
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
    $('.spinner').removeClass('d-none').addClass('spinner-show').addClass('body-bg');
  },
  stop: function () {
    $('.spinner').addClass('d-none').removeClass('spinner-show').removeClass('body-bg');
  }
};

/**
 * Encrypts the access token using AES encryption and sets it in local storage.
 * - The access token to be encrypted and stored.
 */
const setAccessToken = (accessToken) => {
  const encryptedToken = CryptoJS.AES.encrypt(accessToken, SECRET_KEY).toString();
  localStorage.setItem('accessToken', encryptedToken);
};

/**
 * This function retrieves the access token from local storage, decrypts it using a secret key, and returns the decrypted token.
 * @returns {string} The decrypted access token.
 */
const getAccessToken = function () {
  const encryptedToken = localStorage.getItem('accessToken');
  const decryptedToken = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  return decryptedToken;
};

const deleteAccessToken = () => localStorage.clear();

/**
 * This function sends a POST request to the '/refresh' endpoint to get a new access token.
 * If successful, it sets the new access token and returns it.
 * If unsuccessful, it returns the error.
 * @returns {string|Error} The new access token or an error object.
 */
const getNewAccessToken = async function () {
  try {
    const result = await $.post('/refresh'); // Send POST request to '/refresh' endpoint
    setAccessToken(result.accessToken); // Set the new access token
    return result.accessToken; // Return the new access token
  } catch (error) {
    return error; // Return the error object if request fails
  }
};

const setReqHeader = (xhr) => xhr.setRequestHeader('Authorization', `Bearer ${getAccessToken()}`);

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

const blockSpecialChar = function (e) {
  const k = e.keyCode;
  let specialChar;
  if (e.target.name === 'username') {
    specialChar = (k > 64 && k < 91) || (k > 94 && k < 123) || k === 8 || (k >= 48 && k <= 57);
  } else if (e.target.name === 'fullName') {
    specialChar = k === 32 || (k > 64 && k < 91) || (k > 96 && k < 123) || k === 8;
  }

  if (!specialChar) {
    showMessage(`Special characters and numbers are not allowed! "${e.key}"`);
  }

  return specialChar;
};

const updateLinkHtml = function (data) {
  const shortId = $('#urlShortId').val();
  const linkRow = $(`.link-row-id-${shortId}`);
  const statusDiv = linkRow.find('.link-status');
  const redirectUrlDiv = linkRow.find('.link-wrap');
  const shortLinkText = linkRow.find('a.link');

  const modalMsgDiv = $('.modal-msg-div');
  modalMsgDiv.css({
    backgroundColor: '#6efc64',
    borderRadius: '7px'
  });

  showMessage('Link info updated!', 'success');

  setTimeout(() => {
    const modal = $('.modal');
    modal.removeClass('show').hide();
    $('.fade').removeClass('modal-backdrop');

    redirectUrlDiv[0].firstChild.href = data.redirectUrl;
    redirectUrlDiv[0].firstChild.innerText = data.redirectUrl;
    redirectUrlDiv.attr('data-bs-original-title', data.redirectUrl);

    if (!data.status) {
      statusDiv.addClass('bg-gradient-secondary').removeClass('bg-gradient-success').text('Offline');
      shortLinkText.removeClass('text-dark').addClass('text-secondary');
    } else {
      statusDiv.addClass('bg-gradient-success').removeClass('bg-gradient-secondary').text('Running');
      shortLinkText.addClass('text-dark');
    }
  }, 3100);
};

function validateEmail(email) {
  var regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}

const callApiWithNewToken = async function (method, endpoint, data) {
  try {
    const newAccessToken = await getNewAccessToken();
    if (!newAccessToken) return location.replace('/login');
    const response = await callToApi(method, endpoint, data);
    return response;
  } catch (error) {
    return error;
  }
};

//4  <<<<<<<<<<<<<<<<<<<<<<<     CALL TO API       >>>>>>>>>>>>>>>>>>>>>>>>

const callToApi = async function (method, endpoint, data) {
  try {
    const response = await $.ajax({
      type: method,
      url: endpoint,
      data: data,
      beforeSend: setReqHeader
    });
    return response;
  } catch (error) {
    return error;
  }
};

//! <<<<<<<<<<<<<<<<<<<<<<<     AJAX REQUEST      >>>>>>>>>>>>>>>>>>>>>>>>>>

//   <<<<<<<<<<<<<<<<<<<<<<<     SIGN UP      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('.register-form').on('submit', async function (e) {
  e.preventDefault();
  const password = $('#pass').val();
  const isPasswordValid = password.length >= 7 && !password.toLowerCase().includes('password');
  if (!isPasswordValid) {
    return showMessage('Password must be minimum 7 characters and cannot contain "password"!', 'error');
  }
  $('input[type="submit"]').attr('disabled', true);
  spinner.start();
  try {
    const response = await fetch('https://api.geoapify.com/v1/ipinfo?apiKey=1a4b6df0847e460b886172b3971eb66d');
    const data = await response.json();
    const country = data.city.name + ', ' + data.country.name;
    const formData = $('form').serialize() + `&location=${country || '-'}`;
    const result = await $.post('/users', formData);
    showMessage('Your Account Successfully Created!', 'success');
    setTimeout(() => {
      window.location.href = result.redirectUrl;
    }, 2500);
  } catch (error) {
    const errorMsg =
      error.responseJSON?.errors?.password?.message || error?.responseJSON?.code
        ? 'Email already exists!'
        : error?.responseJSON?.errors?.email
        ? 'Email is not valid!'
        : 'Something went wrong! Please try again later.';
    showMessage(errorMsg, 'error');
  } finally {
    spinner.stop();
    $('input[type="submit"]').attr('disabled', false);
  }
});

//   <<<<<<<<<<<<<<<<<<<<<<<     LOGIN      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('.login-form').on('submit', function (event) {
  event.preventDefault();

  // Disable the submit button and start the spinner animation
  const submitButton = $(this).find('input[type="submit"]');
  submitButton.prop('disabled', true);
  spinner.start();

  const formData = $(this).serialize();
  $.post('/users/login', formData)
    .done((response) => {
      // Stop the spinner animation and enable the submit button
      spinner.stop();
      submitButton.prop('disabled', false);

      // Display a success message and set the access token in local storage
      showMessage('Login Successfully!', 'success');
      setAccessToken(response.accessToken);

      // Redirect the user to the home page after a delay of 2.5 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    })
    .fail((error) => {
      // Stop the spinner animation and enable the submit button
      spinner.stop();
      submitButton.prop('disabled', false);

      // Display an error message if the server returns an error message
      showMessage(error.responseJSON?.error, 'error');
    });
});

//   <<<<<<<<<<<<<<<<<<<<<<<     LOGOUT      >>>>>>>>>>>>>>>>>>>>>>>>>>

$('.logout-btn').click(async function () {
  spinner.start();
  try {
    const response = await callToApi('POST', '/users/logout', null);
    location.replace(response.redirectUrl);
  } catch (error) {
    const errJson = error.responseJSON?.error;
    if (errJson === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('POST', '/users/logout', null);
      location.replace(response.redirectUrl);
    } else if (errJson) {
      return showMessage(errJson, 'error');
    } else {
      showMessage('Something went wrong.');
    }
  } finally {
    spinner.stop();
    deleteAccessToken();
  }
});

//   <<<<<<<<<<<<<<<<<<<<<<<     LOGOUT  ALL    >>>>>>>>>>>>>>>>>>>>>>>>>>
$('.logout-all-btn').click(async function () {
  try {
    spinner.start();
    const response = await callToApi('POST', '/users/logoutAll', null);
    showMessage(response.message);
  } catch (error) {
    const errJson = error.responseJSON?.error;
    if (errJson === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('POST', '/users/logoutAll', null);
      return showMessage(response.message);
    } else if (errJson) {
      return showMessage(errJson, 'error');
    } else {
      showMessage('Something went wrong.');
    }
  } finally {
    spinner.stop();
  }
});

//   <<<<<<<<<<<<<<<<<<<<<<<     USER UPDATE      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('#save-profile-btn').on('click', async function () {
  const email = $('input[name=email]').val();
  const fullName = $('input[name=fullName]').val();
  const username = $('input[name=username]').val();

  if (!email || !username || !fullName) {
    $('.modal-msg-div').css({ 'background-color': '#ff6b61', 'border-radius': '7px' });
    return showMessage('All fields required!', 'error');
  }

  if (!validateEmail(email)) {
    $('.modal-msg-div').css({ 'background-color': '#ff6b61', 'border-radius': '7px' });
    return showMessage('Email is valid!', 'error');
  }

  $('#save-profile-btn').attr('disabled', true);
  const data = { email, username, fullName };
  spinner.start();
  try {
    const response = await callToApi('PATCH', '/users', data);
    $('.modal-msg-div').css({ 'background-color': '#6efc64', 'border-radius': '7px' });
    showMessage('Updated Successfully', 'success');
    setTimeout(() => {
      $('.modal').removeClass('show').css('display', 'none');
      $('.fade').removeClass('modal-backdrop');
      $('.fullName').text(response.fullName);
      $('.username').text(response.username);
      $('.email').text(response.email);
    }, 3100);
  } catch (error) {
    if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('PATCH', '/users', data);
      $('.modal-msg-div').css({ 'background-color': '#6efc64', 'border-radius': '7px' });
      showMessage('Updated Successfully', 'success');
      setTimeout(() => {
        $('.modal').removeClass('show').hide();
        $('.fade').removeClass('modal-backdrop');
        $('.fullName').text(response.fullName);
        $('.username').text(response.username);
        $('.email').text(response.email);
      }, 3100);
    } else {
      showMessage(responseJSON?.error, 'error');
    }
  } finally {
    spinner.stop();
    $('#save-profile-btn').removeAttr('disabled');
  }
});

//   <<<<<<<<<<<<<<<<<<<<<<<     DELETE USER      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('#delete-profile-form').on('submit', async function (e) {
  e.preventDefault();
  const password = $('input[type=password]').val();
  if (!password) return;
  spinner.start();
  try {
    await callToApi('DELETE', '/users', { password });
    $('.goodbye-div').removeClass('d-none').addClass('goodbye-show').addClass('body-bg');
    setTimeout(() => {
      deleteAccessToken();
      location.replace('/signup');
      $('.goodbye-div').addClass('d-none');
    }, 4900);
  } catch (error) {
    if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
      const newAccessToken = await getNewAccessToken();
      if (!newAccessToken) return location.replace('/login');
      return showMessage('Try Again');
    } else if (error.responseJSON?.error) {
      return showMessage(error.responseJSON?.error, 'error');
    } else {
      showMessage('Something went wrong.', 'error');
    }
  } finally {
    spinner.stop();
  }
});

//   <<<<<<<<<<<<<<<<<<<<<<<     PICTURE INPUT      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('input[type=file]').on('change', function () {
  const file = $(this);
  if (!file[0].files.length) {
    $('#upload-picture-btn').addClass('d-none');
  } else {
    $('#upload-picture-btn').removeClass('d-none');
  }
});

//   <<<<<<<<<<<<<<<<<<<<<<<     UPLOAD PICTURE      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('#picture-form').on('submit', async function (e) {
  e.preventDefault();
  const file = $('input[type=file]')[0].files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData
  };

  spinner.start();
  let errorMsg;
  const avatarImgSrc = $('.avatar-img')[0].src;

  try {
    const response = await fetch('/users/me/avatar', options);
    if (!response.ok && response.status === 403) {
      errorMsg = 'EXPIRED_TOKEN';
      throw new Error();
    }

    $('.avatar-img').attr('src', '/assets/img/loading.svg');
    const data = await response.json();
    setTimeout(() => {
      $('.avatar-img').attr('src', data.imgUrl);
    }, 1500);
  } catch (error) {
    if (errorMsg === 'EXPIRED_TOKEN') {
      const newAccessToken = await getNewAccessToken();
      if (!newAccessToken) return location.replace('/login');
      options.headers = { Authorization: `Bearer ${getAccessToken()}` };
      const response = await fetch('/users/me/avatar', options);
      if (!response.ok) {
        throw new Error();
      }
      $('.avatar-img').attr('src', '/assets/img/loading.svg');
      const data = await response.json();
      setTimeout(() => {
        $('.avatar-img').attr('src', data.imgUrl);
      }, 1000);
    } else {
      $('.avatar-img').attr('src', avatarImgSrc);
      $('.modal-msg-div').css({ 'background-color': '#ff6b61', 'border-radius': '7px' });
      showMessage('Only image is allowed!', 'error');
    }
  } finally {
    spinner.stop();
  }
});

//   <<<<<<<<<<<<<<<<<<<<<<<     DELETE PICTURE      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('#delete-picture-btn').on('click', async function () {
  const avatarImg = $('.avatar-img');
  try {
    spinner.start();
    const response = await callToApi('DELETE', '/users/me/avatar', null);
    avatarImg.attr('src', '/assets/img/loading.svg');
    setTimeout(() => {
      avatarImg.attr('src', 'https://img.icons8.com/stickers/100/user.png');
    }, 1500);
    $('.modal-msg-div').css({ 'background-color': '#6efc64', 'border-radius': '7px' });
    showMessage(response.message, 'success');
  } catch (error) {
    if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('DELETE', '/users/me/avatar', null);
      avatarImg.attr('src', '/assets/img/loading.svg');
      setTimeout(() => {
        avatarImg.attr('src', 'https://img.icons8.com/stickers/100/user.png');
      }, 1500);
      $('.modal-msg-div').css({ 'background-color': '#6efc64', 'border-radius': '7px' });
      showMessage(response.message, 'success');
    } else {
      showMessage('Something went wrong.', 'error');
    }
  } finally {
    spinner.stop();
    $('#delete-picture-btn').remove();
  }
});

//2   <<<<<<<<<<<<<<<<<<<<<<<     CREATE URL      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('.url-form').on('submit', async function (e) {
  e.preventDefault();
  const urlInput = $('input[name="url"]').val();
  if (!validateUrl(urlInput)) {
    return showMessage('Url is not valid!', 'error');
  }
  const formBtn = $('button[type="submit"]');
  formBtn.prop('disabled', true);
  $('.short-url-div').empty();
  try {
    const response = await callToApi('POST', '/url', $(this).serialize());
    showNewGeneratedUrl(response);
  } catch (error) {
    if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('POST', '/url', $(this).serialize());
      showNewGeneratedUrl(response);
    } else {
      showMessage(error.responseJSON?.error, 'error');
    }
  } finally {
    spinner.stop();
    formBtn.removeAttr('disabled');
  }
});

//2   <<<<<<<<<<<<<<<<<<<<<<<     ANALYTICS URL      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('.analytics-form').on('submit', async function (e) {
  e.preventDefault();
  const analyticsDiv = $('.analytics-data-div');
  const analyticsBtn = $('button[type="submit"]');
  const url = $('input[name="url"]').val();
  // if (!validateUrl(url)) {
  //   return showMessage('Url is not valid!', 'error');
  // }

  const id = url.split('/url/')[1];

  if (!id) return showMessage('Please use valid url!');

  analyticsBtn.prop('disabled', true);
  analyticsDiv.hide();

  spinner.start();
  try {
    const response = await callToApi('GET', '/url/analytics', { id });
    analyticsDiv.show();
    $('.table-body').empty();
    response.clickHistory?.forEach((history, index) => {
      $('.total-clicks')
        .empty()
        .append(index + 1);
      $('.table-body').append(`
        <tr>
        <th scope="row">${index + 1}</th>
        <td>${history.date}</td>
        <td>${history.ipAddress}</td>
        <td>${response.redirectUrl}</td>
        </tr>
        `);
    });
  } catch (error) {
    if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('GET', '/url/analytics', { id });
      analyticsDiv.show();
      $('.table-body').empty();
      response.clickHistory?.forEach((history, index) => {
        $('.total-clicks')
          .empty()
          .append(index + 1);
        $('.table-body').append(`
        <tr>
        <th scope="row">${index + 1}</th>
        <td>${history.date}</td>
        <td>${history.ipAddress}</td>
        <td class='overflow-hidden'>${response.redirectUrl}</td>
        </tr>
        `);
      });
    } else {
      analyticsDiv.hide();
      $('.table-body', '.total-clicks').empty();
      showMessage(error.responseJSON?.error, 'error');
    }
  } finally {
    spinner.stop();
    analyticsBtn.prop('disabled', false);
  }
});

//2   <<<<<<<<<<<<<<<<<<<<<<<     UPDATE URL      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('#update-link-btn').on('click', async function () {
  const redirectUrl = $('#url').val();
  const shortId = $('#urlShortId').val();
  const status = $('#linkStatus').val() === 'running';

  if (!validateUrl(redirectUrl)) {
    $('.modal-msg-div').css({ backgroundColor: '#ff6b61', borderRadius: '7px' });
    return showMessage('Url is not valid!', 'error');
  }

  spinner.start();
  $('#update-link-btn, #delete-link-btn').attr('disabled', true);

  try {
    const response = await callToApi('PATCH', '/url', { redirectUrl, shortId, status });
    updateLinkHtml(response);
  } catch (error) {
    if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('PATCH', '/url', { redirectUrl, shortId, status });
      updateLinkHtml(response);
    } else {
      $('.modal-msg-div').css({ backgroundColor: '#ff6b61', borderRadius: '7px' });
      showMessage(error.responseJSON?.error, 'error');
    }
  } finally {
    spinner.stop();
    $('#update-link-btn, #delete-link-btn').removeAttr('disabled');
  }
});

//2   <<<<<<<<<<<<<<<<<<<<<<<     DELETE URL      >>>>>>>>>>>>>>>>>>>>>>>>>>
$('#delete-link-btn').on('click', async function () {
  const shortId = $('#urlShortId').val();
  const userConsent = confirm('Are you sure you want to delete this link?');
  if (!shortId || !userConsent) return;

  $('#delete-link-btn, #update-link-btn').attr('disabled', true);
  spinner.start();

  try {
    const response = await callToApi('DELETE', '/url', { shortId });
    $('.modal-msg-div').css({ 'background-color': '#6efc64', 'border-radius': '7px' });
    showMessage(response.message, 'success');
    setTimeout(() => {
      $('.modal').removeClass('show').css('display', 'none');
      $('.fade').removeClass('modal-backdrop');
      $(`.link-row-id-${shortId}`).remove();
    }, 3100);
  } catch (error) {
    if (error.responseJSON?.error === 'EXPIRED_TOKEN') {
      const response = await callApiWithNewToken('DELETE', '/url', { shortId });
      $('.modal-msg-div').css({ 'background-color': '#6efc64', 'border-radius': '7px' });
      showMessage(response.message, 'success');
      setTimeout(() => {
        $('.modal').removeClass('show').hide();
        $('.fade').removeClass('modal-backdrop');
        $(`.link-row-id-${shortId}`).remove();
      }, 3100);
    } else {
      $('.modal-msg-div').css({ backgroundColor: '#ff6b61', borderRadius: '7px' });
      showMessage(error.responseJSON?.error, 'error');
    }
  } finally {
    spinner.stop();
    $('#delete-link-btn, #saveLink,  #update-link-btn').removeAttr('disabled');
  }
});

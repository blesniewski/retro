
// newGuid code from https://stackoverflow.com/questions/26203453/jquery-generate-unique-ids
function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
}
function rerouteToMain() {
    clearInterval(getCookie('intervalId'));
    setCookie('buzzword', "", -1);
    setCookie('isOwner', "", -1);
    setCookie('intervalId', "", -1);
    alert("Session no longer exists, you will be redirected to the main page now");
    location.reload();
}
function checkIfGameValid() {
    $.ajax({
        url: "/game/getIsGameValid",
        type: "POST",
        data: JSON.stringify({ buzzword: getCookie('buzzword') }),
        contentType: "application/json; charset=utf-8",
        success: function (result, status) {
            if (!result.isGameValid) {
                rerouteToMain();
            }
        },
    })
}
function endGameBtnClicked() {
    $.ajax({
        url: "/game/endGame",
        type: "POST",
        data: JSON.stringify({ buzzword: getCookie('buzzword'), user: getCookie('userid') }),
        contentType: "application/json; charset=utf-8",
        success: function (result, status) {
            rerouteToMain();
        },
    })
}
function entryDelBtnClicked(event) {
    console.log(event.currentTarget.id)
    entryId = $('#' + event.currentTarget.id).attr('entryId')
    $.ajax({
        url: "/game/deleteEntry",
        type: "POST",
        data: JSON.stringify({
            buzzword: getCookie('buzzword'),
            entryId: entryId,
            user: getCookie('userid')
        }),
        contentType: "application/json; charset=utf-8",
    });
}
function entryEditBtnClicked(event) {
    entryId = $('#' + event.currentTarget.id).attr('entryId')
    $('#entryEditModal').attr('entryId', entryId);
    $('#modal-edited-entry-text').text($('#' + entryId + 'p').text());
    $('#entryEditModal').appendTo("body").modal('show');
}
function editEntryModalClose() {
    $('#entryEditModal').modal("toggle");
}
function editEntryModalSend() {
    $.ajax({
        url: "/game/editEntry",
        type: "POST",
        data: JSON.stringify({
            buzzword: getCookie('buzzword'),
            entryId: $('#entryEditModal').attr('entryId'),
            contents: $('#modal-edited-entry-text').val(),
            user: getCookie('userid')
        }),
        contentType: "application/json; charset=utf-8",
    });
    editEntryModalClose();
}

function refreshCategory(category) {
    $.ajax({
        url: "/game/getCategoryEntries",
        type: "POST",
        data: JSON.stringify({
            buzzword: getCookie('buzzword'),
            category: category,
            user: getCookie('userid')
        }),
        contentType: "application/json; charset=utf-8",
        success: function (result, status) {
            //console.log(result.type);
            if (result.isGameValid) {
                $("#" + category + 'List').empty();
                result.entries.forEach(element => {
                    console.log("Element")
                    if (element.madeByUser) {
                        $("#" + category + 'List').append(
                            '<div class="list-group-item py-1 bg-light text-dark d-flex flex-row" style="width: 100%" id="' + element.id + '">'
                            + '<div class="col-sm-10">'
                            + '<p class="text-break mt-2" id="' + element.id + 'p">' + element.contents + '</p>'
                            + '</div>'
                            + '<div class="vstack col">'
                            + '<button id="' + element.id + 'DelBtn" entryId="' + element.id + '" class="btn btn-outline-danger mt-1 mb-1" onClick=entryDelBtnClicked(event)>'
                            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">'
                            + '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>'
                            + '<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>'
                            + '</svg>'
                            + '</button>'
                            + '<button id="' + element.id + 'EditBtn" entryId="' + element.id + '" class="btn btn-outline-dark" onClick=entryEditBtnClicked(event)>'
                            + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">'
                            + '<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>'
                            + '</svg>'
                            + '</button>'
                            + '</div>'
                            + '</div>');
                    } else {
                        $("#" + category + 'List').append('<div class="list-group-item py-1" style="width: 100%" id="'
                            + element.id + '"><p class="text-break mt-2">'
                            + element.contents + '</p></div>');

                    }
                });
            }
        },
    })
}

function newEntryBtnClicked(category, contents) {
    if (contents == '') {
        return;
    }
    $.ajax({
        url: "/game/newEntry",
        type: "POST",
        data: JSON.stringify({
            buzzword: getCookie('buzzword'),
            category: category,
            contents: contents, user: getCookie('userid')
        }),
        contentType: "application/json; charset=utf-8",
        success: function (result, status) {
            //console.log(result);
            $('#' + category + 'Input').val('');
            refreshCategory(result.category);
        },
    })
}
function setBuzzwordLabel(buzzword) {
    $("#gameBuzzword").text(buzzword);
}
function refreshAdminPanel() {
    $('#endGameDiv').hide();
    if (getCookie("isOwner") == 'true') {
        $('#endGameDiv').show();
    }
}
function checkIfUserIsOwner() {
    $.ajax({
        url: "/game/checkIfUserIsOwner",
        type: "POST",
        data: JSON.stringify({
            buzzword: getCookie("buzzword"),
            user: getCookie('userid')
        }),
        contentType: "application/json; charset=utf-8",
        success: function (result, status) {
            setCookie("isOwner", result.isOwner, 1);
            refreshAdminPanel();
        },
    });
}

function requestNewBuzzword() {
    $.ajax({
        url: "/game/requestBuzzword",
        type: "POST",
        data: JSON.stringify({
            game: getCookie('gameType'),
            user: getCookie('userid')
        }),
        contentType: "application/json; charset=utf-8",
        success: function (result, status) {
            //console.log(result);
            setBuzzwordLabel(result.buzzword);
            setCookie("buzzword", result.buzzword, 1)
            checkIfUserIsOwner();
        },
    })
}
async function configureOwner() {
    requestNewBuzzword();
}
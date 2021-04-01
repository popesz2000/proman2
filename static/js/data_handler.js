// this object contains the functions which handle the data and its reading/writing
// feel free to extend and change to fit your needs

// (watch out: when you would like to use a property/function of an object from the
// object itself then you must use the 'this' keyword before. For example: 'this._data' below)
export let dataHandler = {
    _data: {}, // it is a "cache for all data received: boards, cards and statuses. It is not accessed from outside.
    _api_get: function (url, callback) {
        // it is not called from outside
        // loads data from API, parses it and calls the callback with it

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())  // parse the response as JSON
        .then(json_response => callback(json_response));  // Call the `callback` with the returned object
    },
    _api_post: function (url, data) {
        // it is not called from outside
        // sends the data to the API, and calls callback function
        fetch(url, {
            method: 'POST',
            credentials: "include",
            body: JSON.stringify(data),
            headers: new Headers ({"content-type": "application/json"})
        })
        .then(response => response.json())
    },
    init: function () {
    },
    getBoards: function (callback) {
        // the boards are retrieved and then the callback function is called with the boards

        // Here we use an arrow function to keep the value of 'this' on dataHandler.
        //    if we would use function(){...} here, the value of 'this' would change.
        this._api_get('/get-boards', (response) => {
            this._data['boards'] = response;
            callback(response);
        });
    },
    getBoard: function (boardId, callback) {
        // the board is retrieved and then the callback function is called with the board
    },
    getStatuses: function (callback) {
        this._api_get('/get-statuses', (response) => {
            this._data['statuses'] = response;
            callback(response);
        });
    },
    getStatus: function (statusId, callback) {
        // the status is retrieved and then the callback function is called with the status
    },
    getCardsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
        this._api_get(`/get-cards/${boardId}`, (response) => {
            this._data['cards'] = response;
            callback(response);
        });
    },
    getCard: function (cardId, callback) {
        // the card is retrieved and then the callback function is called with the card
    },
    createNewBoard: function () {
        let button = document.getElementById('createBoardButton')
        $(button).click(function() {
            let name = document.getElementById('board-name').value;
            let data = {
                boardName: name
            }
            dataHandler._api_post('/add_new_board', data)
            $('#createBoard').modal('hide');
            location.reload()
        })
    },
    createNewCard: function (board, order) {
        let button = document.getElementById('createCardButton');
        $(button).click(function(){
            let name = document.getElementById('card-name').value;
            let data = {
                boardId: board,
                cardName: name,
                status: 'new',
                position: order
            }
            dataHandler._api_post('/add_new_card', data)
            $('#createCard').modal('hide');
            location.reload()
        })
    },


    saveCards: function(id, board, stat, order) {
        let data = {
            cardId: id,
            status: stat,
            position: order,
            boardId: board
        }
        this._api_post('/save_card_position', data)
    },

    renameBoard: function () {
        let boardTitles = document.querySelectorAll(".board-title");
        let saveButton = document.getElementById("rename-save")
        for(let boardTitle of boardTitles) {
            boardTitle.addEventListener("click", function () {
            saveButton.style.visibility = "visible"
            })
            boardTitle.setAttribute("contenteditable", true);
        }
    },

    renameSave: function (url, title) {
        let saveButton = document.getElementById("rename-save");
        let titles = document.querySelectorAll(`${title}`);
        saveButton.style.visibility = "hidden"
        saveButton.addEventListener("click", function () {
            saveButton.style.visibility = "hidden"
            let titleList = "";
            for(let title of titles) {
                titleList += title.textContent + ",";
            }
            let data = {
                titles: titleList,
            }
            dataHandler._api_post(`${url}`, data)
        });
    },

    renameCards: function () {
        let cardTitles = document.querySelectorAll(".card-title");
        let saveButton = document.getElementById("rename-save")
        for (let cardTitle of cardTitles) {
            cardTitle.addEventListener("click", function () {
                saveButton.style.visibility = "visible"
            })
            cardTitle.setAttribute("contenteditable", true);
        }
    },



    renameColumns: function () {
        let boardTitles = document.querySelectorAll(".board-column-title");
        let saveButton = document.getElementById("rename-save")
        for(let boardTitle of boardTitles) {
            boardTitle.addEventListener("click", function () {
            saveButton.style.visibility = "visible"
            })
            boardTitle.setAttribute("contenteditable", true);
        }
    },


    // renameColumnsSave: function () {
    //     let saveButton = document.getElementById("rename-save");
    //     let columnTitles = document.querySelectorAll(".board-column-title");
    //     saveButton.style.visibility = "hidden"
    //     saveButton.addEventListener("click", function () {
    //         saveButton.style.visibility = "hidden"
    //         let columnTitleList = "";
    //         for (let columnTitle of columnTitles) {
    //             columnTitleList += columnTitle.textContent + ",";
    //         }
    //         let data = {
    //             column_Titles: columnTitleList,
    //         }
    //         dataHandler._api_post('/rename-column-save', data)
    //     })
    // },

    addColumn: function () {
        let addButtons = document.getElementsByClassName("column-add")
        let columnTitles = document.getElementsByClassName("board-column-title")
        let columnTitleList = ''
        let numOfBoards = document.getElementsByClassName("board").length
        for (let addButton of addButtons) {
            addButton.addEventListener("click", function () {
                for (let i = 0; i<columnTitles.length/numOfBoards; i++) {
                    columnTitleList += columnTitles[i].innerText + ","
                }
                let data = {
                    column_titles: columnTitleList,
                }
                dataHandler._api_post('/add-column', data)
                location.reload();
            })
        }
    },
    delete: function (url, title) {
        let delButtons = document.getElementsByClassName(`${title}`)
        for (let delButton of delButtons) {
            delButton.addEventListener("click", function () {
                let Id = delButton.getAttribute("id")
                let data = {
                    id: Id,
                }
                dataHandler._api_post(`${url}`, data)

                location.reload();
            })
        }
    },
    // deleteBoard: function () {
    //     let delBoardButtons = document.getElementsByClassName("board-delete")
    //     for (let delBoardButton of delBoardButtons) {
    //         delBoardButton.addEventListener("click", function () {
    //             let delBoardId = delBoardButton.getAttribute("id")
    //             let data = {
    //                 board_id: delBoardId,
    //             }
    //             dataHandler._api_post('/del-board', data)
    //
    //             location.reload();
    //         })
    //     }
    // },
    // deleteCol: function () {
    //     let delColButtons = document.getElementsByClassName("col-delete")
    //     for (let delColButton of delColButtons) {
    //         delColButton.addEventListener("click", function () {
    //             let delColId = delColButton.getAttribute("id")
    //             let data = {
    //                 col_id: delColId,
    //             }
    //             dataHandler._api_post('/del-col', data)
    //
    //             location.reload();
    //         })
    //     }
    // },
};

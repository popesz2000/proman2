// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
        dom.loadBoards();
    },


    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards){
            dom.showBoards(boards);
        });
    },


    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        for(let board of boards){
            let boardContainer = document.querySelector('.board-container')
            let section = document.createElement('section')
            section.classList.add('board')
            section.setAttribute('id', board.id)
            let header = document.createElement('div')
            header.classList.add('board-header')
            let boardTitle = document.createElement('p')
            boardTitle.classList.add('board-title')
            boardTitle.innerText = board.title
            let boardToggle = document.createElement('button')
            boardToggle.classList.add('board-toggle')
            boardToggle.setAttribute('data-boardnum', board.id);
            boardToggle.innerText = "/\\"
            let addCard = document.createElement('button')
            addCard.classList.add('card-add')
            addCard.innerText = "Add card"
            let addColumn = document.createElement('button')
            addColumn.classList.add('column-add')
            addColumn.innerText = "Add column"
            let archivedCards = document.createElement('button')
            archivedCards.classList.add('archived-cards')
            archivedCards.innerText = "Archived cards"
            let boardDelete = document.createElement('button')
            boardDelete.classList.add('board-delete', 'fas', 'fa-trash-alt')
            boardDelete.setAttribute("id", board.id)
            header.append(boardToggle, addCard, addColumn, archivedCards, boardTitle, boardDelete)
            let boardColumns = document.createElement('div')
            boardColumns.classList.add(`board-columns${board.id}`, 'board-columns')
            section.append(header, boardColumns)
            boardContainer.appendChild(section)
            dom.loadStatuses(board.id)
        }
        // dataHandler.renameBoard();
        // dataHandler.renameSave();
        // dom.closeBoard();
        // dom.addColumn();
        // window.addEventListener('load', (event) => {
        //     dom.deleteCard();
        //     dom.deleteBoard();
        //     dom.deleteCol();
        // });
    },

    createColumn: function(columnName, columnId, boardId) {
        let boardColumns = document.querySelector(`.board-columns${boardId}`)
        let column = document.createElement('div')
        column.classList.add('board-column')
        let title = document.createElement('div');
        title.classList.add('board-column-title');
        title.innerText = columnName;
        let colDelete = document.createElement('button')
        colDelete.classList.add('col-delete', 'fas', 'fa-trash-alt')
        colDelete.setAttribute("id", columnId)
        let content = document.createElement('div');
        content.classList.add('board-column-content');
        title.appendChild(colDelete)
        column.append(title, content);
        boardColumns.appendChild(column);
        dom.loadCards(boardId, columnName, content)

        // dom.renameColumns();
        // dom.renameColumnsSave();
    },


    loadCards: function (boardId, column, container) {
        // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(boardId,function(cards) {
            dom.showCards(cards, boardId, column, container)
        });
    },


    showCards: function (cards, boardId, column, container) {
        for (let card of cards) {
            if (card.status_id === column) {
                let cardContainer = document.createElement('div');
                cardContainer.classList.add('card');
                cardContainer.setAttribute("id", card.id)
                let cardRemove = document.createElement('div');
                cardRemove.classList.add('card-remove', 'fas', 'fa-trash-alt');
                cardRemove.setAttribute("id", card.id)
                let cardArchive = document.createElement('div');
                cardArchive.classList.add('card-archive', 'fas', 'fa-archive');
                cardArchive.setAttribute("id", card.id)
                let cardTitle = document.createElement('div');
                cardTitle.classList.add('card-title');
                cardTitle.innerText = card.title;
                cardContainer.append(cardRemove, cardArchive, cardTitle);
                container.append(cardContainer);
            }
        }
    },


    loadStatuses: function (boardId) {
        dataHandler.getStatuses(function(statuses){
            dom.showStatuses(statuses, boardId);
        });
    },


    showStatuses: function (statuses, boardId) {
        for (let status of statuses) {
            dom.createColumn(status.title, status.id, boardId)
        }
    },
    archiveCards: function () {
        let archButtons = document.getElementsByClassName('card-archive')
        for (let archButton of archButtons) {
            archButton.addEventListener("click", function () {
                let cardId = this.getAttribute("id")
                let cards = document.getElementsByClassName('card')
                for (let card of cards) {
                    if (card.getAttribute("id") == cardId) {
                        card.style.display = "none"
                        card.classList.add('archived')
                    }
                }
            })
        }
    },
    showArchivedCards: function () {
        let archivedButtons = document.getElementsByClassName('archived-cards')
        for (let archivedButton of archivedButtons) {
            archivedButton.addEventListener("click", function () {
                let archivedCards = document.getElementsByClassName('archived')
                let archivedCardsList = []
                let archivedCardsIdList = []
                for (let archivedCard of archivedCards) {
                    let archivedCardTitleElement = archivedCard.getElementsByClassName("card-title")
                    archivedCardsIdList.push(archivedCard.getAttribute("id"))
                    for (let archivedCardTitle of archivedCardTitleElement) {
                        archivedCardsList.push(archivedCardTitle.innerText)
                    }
                }
                let list = document.createElement('ul');
                for (let i = 0; i < archivedCardsList.length; i++) {
                    let item = document.createElement('li');
                    item.classList.add("archived-card-list");
                    item.setAttribute("id", archivedCardsIdList[i])

                    item.appendChild(document.createTextNode(archivedCardsList[i]));

                    let unarchiveButton = document.createElement('button')
                    unarchiveButton.setAttribute("id", archivedCardsIdList[i])
                    unarchiveButton.classList.add('unarchive-button')
                    unarchiveButton.classList.add('unarchive-button')
                    unarchiveButton.innerText = "Unarchive card"

                    item.appendChild(unarchiveButton)
                    list.appendChild(item);
                }
                let archivedCardsModal = document.getElementsByClassName("archived-cards-list")
                for (let i of archivedCardsModal) {
                    i.append(list)
                }
                $('#archivedCards').modal('show');
                dom.unarchiveCard();
            })
        }
    },
    unarchiveCard: function () {
        let unarchiveButtons = document.getElementsByClassName("unarchive-button")
        for (let unarchiveButton of unarchiveButtons) {
            unarchiveButton.addEventListener("click", function () {
                let archivedCards = document.getElementsByClassName('archived')
                for (let archivedCard of archivedCards) {
                    console.log(archivedCard)
                    if (archivedCard.getAttribute("id") == unarchiveButton.getAttribute("id")) {
                        console.log(archivedCard)
                        archivedCard.style.display = ""
                        let archivedCardsList = document.getElementsByClassName("archived-card-list")
                        for (let archivedCardList of archivedCardsList) {
                            if (archivedCardList.getAttribute("id") == unarchiveButton.getAttribute("id")) {
                                archivedCardList.remove()
                            }
                        }
                    }
                }
            })
        }
    },
};

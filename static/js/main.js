import { dom } from "./dom.js";
import {dataHandler} from "./data_handler.js";

// This function is to initialize the application
function init() {
    // init data
    dom.init();
    // loads the boards to the screen
    // dom.loadBoards();


}


function openCreateBoardModal() {
    let openLink = document.getElementById('createPublicBoard');
    $(openLink).click(function() {
        $('#createBoard').modal('show');
        dataHandler.createNewBoard();
    })
}


function closeModal() {
    let closeButtons = document.querySelectorAll('.close');
    for (let button of closeButtons) {
        $(button).click(function() {
            $('#createBoard').modal('hide');
            $('#createCard').modal('hide');
        })
    }
}


function collectCardsAndSlots() {
    let draggables = document.querySelectorAll('.card');
    let dropZones = document.querySelectorAll('.board-column-content')
    initDraggables(draggables);
    initDropZones(dropZones);
}


function initDraggables(draggables) {
    for (let draggable of draggables) {
        initDraggable(draggable);
    }
}


function initDropZones(dropZones) {
    for (let dropZone of dropZones) {
        initDropZone(dropZone);
    }
}


function initDraggable(draggable) {
    draggable.addEventListener("dragstart", dragStartHandler);
    draggable.addEventListener("dragend", dragEndHandler);
    draggable.setAttribute("draggable", "true");
}


function initDropZone(dropZone) {
    dropZone.addEventListener("dragenter", dropZoneEnterHandler);
    dropZone.addEventListener("dragover", dropZoneOverHandler);
    dropZone.addEventListener("dragleave", dropZoneLeaveHandler);
    dropZone.addEventListener("drop", dropZoneDropHandler);
}


function dragStartHandler(e) {
    setDropZonesHighlight();
    this.classList.add('dragged', 'drag-feedback');
    e.dataTransfer.setData("type/dragged-box", 'dragged');
    window.cardId = this.id;
}


function dragEndHandler() {
    setDropZonesHighlight(false);
    this.classList.remove('dragged');
}


function dropZoneEnterHandler(e) {
    if (e.dataTransfer.types.includes('type/dragged-box')) {
        this.classList.add("over-zone");
        e.preventDefault();
    }
}


function dropZoneOverHandler(e) {
    if (e.dataTransfer.types.includes('type/dragged-box')) {
        e.preventDefault();
    }
}


function dropZoneLeaveHandler(e) {
    if (e.dataTransfer.types.includes('type/dragged-box') &&
        e.relatedTarget !== null &&
        e.currentTarget !== e.relatedTarget.closest('.card-slot')) {
            this.classList.remove('over-zone');
    }
}


function dropZoneDropHandler(e) {
    let draggedElement = document.querySelector('.dragged');
    e.currentTarget.appendChild(draggedElement);
    e.preventDefault();
    let status = this.parentElement.firstChild.innerText;
    let order = this.children.length - 1;
    let boardId = this.parentElement.parentElement.parentElement.id
    let cardId = window.cardId;
    dataHandler.saveCards(cardId, boardId, status, order);
}


function setDropZonesHighlight(highlight = true) {
    let dropZones = document.querySelectorAll('.board-column-content')
    for (let dropzone of dropZones) {
        if (highlight) {
            dropzone.classList.add("active-zone");
        }
        else {
            dropzone.classList.remove("active-zone");
            dropzone.classList.remove("over-zone");
        }
    }
}


function openCreateCardModal() {
    let buttons = document.querySelectorAll('.card-add')
    for (let button of buttons) {
        $(button).click(function() {
            $('#createCard').modal("show");
            let boardId = this.parentElement.parentElement.id
            let position = this.parentElement.parentElement.lastChild.firstChild.lastChild.childNodes.length
            dataHandler.createNewCard(boardId, position);
        })
    }
}


function closeBoard () {
    let closeButtons = document.querySelectorAll(".board-toggle");
    for (let closeButton of closeButtons) {
        closeButton.addEventListener("click", function () {
            let boardNum = this.getAttribute("data-boardnum")
            let targetBoard = document.querySelector(`.board-columns${boardNum}`)
            if (targetBoard.style.display !== "none") {
                targetBoard.style.display = "none"
                closeButton.innerText = "\\/"
            }
            else {
                targetBoard.style.display = ""
                closeButton.innerText = "/\\"
            }
        })
    }
}


init();
window.onload = function() {
    openCreateBoardModal();
    closeModal();
    collectCardsAndSlots();
    openCreateCardModal();
    closeBoard()
    dataHandler.renameSave('/rename-save','.board-title')
    dataHandler.renameSave('/rename-column-save','.board-column-title')
    dataHandler.renameSave('/rename-card-save', '.card-title')
    dataHandler.renameBoard()
    dataHandler.renameColumns()
    dataHandler.renameCards()
    // dataHandler.renameColumnsSave()
    dataHandler.addColumn()
    dataHandler.delete('/del-card', 'card-remove')
    dataHandler.delete('del-board', 'board-delete')
    dataHandler.delete('/del-col', 'col-delete')
    // dataHandler.deleteCol()
    dom.archiveCards();
    dom.showArchivedCards();
}

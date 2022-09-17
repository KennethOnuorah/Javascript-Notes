import dataJSON from "./json/data.json" assert {type: "json"}

let noteCounter = document.getElementById("note_counter")
let noteList = localStorage.getItem("noteList") != null ? localStorage.getItem("noteList").split(',') : []
const addNoteBtn = document.getElementById("add_note_button")
const editNoteBtn = document.getElementById("edit_note_button")
let editNoteBtnIcon = document.getElementById("edit_note_button_icon")
let editMode = false
const deleteNoteBtn = document.querySelector(".delete_note_button")
let deleteNoteBtnIcon = document.getElementById("delete_note_button_icon")
let deleteMode = false
const backBtn = document.getElementById("back_button")
const searchBar = document.querySelector(".search_bar")
const noteDisplaySection = document.querySelector(".note_display_outline")

//clear()
load()

addNoteBtn.addEventListener("click", function(){
    if(!editMode && searchBar.value == ""){
        //Increment total notes created in local storage
        if(localStorage.getItem("totalNotesCreated") != null){
            localStorage.setItem("totalNotesCreated", (parseInt(localStorage.getItem("totalNotesCreated")) + 1).toString())
        }else{
            localStorage.setItem("totalNotesCreated", "0")
            localStorage.setItem("noteList", "[]")
        }
        //Create default note, then prepend to DOM
        const defaultNote = document.createElement("div")
        defaultNote.className = "note", defaultNote.id = "note" + (parseInt(localStorage.getItem("totalNotesCreated")) + 1), defaultNote.style.backgroundColor = dataJSON.allColors[0]
        const defaultTitle = document.createElement("h1")
        defaultTitle.textContent = "[Enter title]", defaultTitle.contentEditable = false
        const defaultDesc = document.createElement("h3")
        defaultDesc.textContent = "[Enter description]", defaultDesc.contentEditable = false
        const defaultTime = document.createElement("h5")
        defaultTime.textContent = "Posted just now", defaultTime.id = `${defaultNote.id}_timePosted`

        defaultNote.appendChild(defaultTitle)
        defaultNote.appendChild(defaultDesc)
        defaultNote.appendChild(defaultTime)

        localStorage.setItem(defaultNote.id, defaultNote.outerHTML)
        localStorage.setItem(defaultTime.id, new Date())

        noteDisplaySection.prepend(defaultNote)
        defaultNote.style.opacity = "0"
        defaultNote.style.animation = "fade_in 0.5s forwards"
    }
    searchBar.value == "" ? updateNoteInformation() : console.warn("Cannot update note info at this time")
    console.log(noteList)
    console.log(localStorage.getItem("noteList"))
})
editNoteBtn.addEventListener("click", function(){
    editMode = (noteList.length > 0 && searchBar.value == "") ? !editMode : editMode
    editNoteBtnIcon.src = editMode ? "images/save_icon.png" : "images/edit_icon.png"
    noteDisplaySection.childNodes.forEach(child => {
        child.childNodes.forEach(text => {
            if(editMode && (text.nodeName == "H1" || text.nodeName == "H3")){
                text.contentEditable = true
                return
            }
            text.contentEditable = false
        });
    });
    !editMode ? save() : console.warn("Cannot save at this time")
})
deleteNoteBtn.addEventListener("click", function(){
    if(deleteMode){
        if(!confirm(`${dataJSON.notesForDeletion.length} note${(dataJSON.notesForDeletion.length != 1 ? "s" : "")} will be deleted. Press OK to confirm deletion.`)) return
        deleteNotes()
    }
    if(!editMode && noteList.length > 0 && searchBar.value == ""){
        deleteMode = true
        deleteNoteBtnIcon.src = "./images/trash_icon2.png"
        addNoteBtn.style.display = editNoteBtn.style.display = "none"
        backBtn.style.display = "inline"
    }
})
backBtn.addEventListener("click", function(){
    deleteMode = false
    deleteNoteBtnIcon.src = "./images/trash_icon1.png"
    addNoteBtn.style.display = editNoteBtn.style.display = "inline"
    backBtn.style.display = "none"
    dataJSON.notesForDeletion = []
    noteList.forEach(note => {
        document.getElementById(note.id).style.border = "none"
        document.getElementById(note.id).style.animation = "0"
        document.getElementById(note.id).style.opacity = "1"
    })
})
searchBar.addEventListener("input", function(){
    let undesiredResults = 0
    noteList.forEach(note => {
        let postTime = document.getElementById(`${note.id}_timePosted`).textContent
        let rawPostText = document.getElementById(note.id).textContent.replace(postTime, "")
        document.getElementById(note.id).style.display = rawPostText.toLowerCase().includes(searchBar.value.toLowerCase()) ? "block" : "none"
        if(document.getElementById(note.id).style.display == "none") undesiredResults += 1
    })
    let noResults = (undesiredResults == noteList.length)
    noResults ? 
        (document.getElementById("nothing_prompt").style.opacity = "1", 
        document.getElementById("nothing_prompt").innerHTML = "Nothing.") : 
        (document.getElementById("nothing_prompt").style.opacity = "0")
})
function updateNoteInformation(){
    noteList = Array.from(document.querySelectorAll(".note"))
    localStorage.setItem("noteList", noteList.map(note => note.id).toString())
    noteCounter.innerHTML = noteList.length + (noteList.length == 1 ? " note" : " notes")
    noteList.length == 0 ?
        (document.getElementById("nothing_prompt").style.opacity = "1", 
        document.getElementById("nothing_prompt").innerHTML = "Nothing. Click the \"+\" button to create a new note.") : 
        (document.getElementById("nothing_prompt").style.opacity = "0")
    noteList.forEach(note => {
        document.getElementById(`${note.id}_timePosted`).innerHTML = updatePostDateDisplay(localStorage.getItem(`${note.id}_timePosted`))
        if(!dataJSON.notesWithEL.includes(note)){
            dataJSON.notesWithEL.push(note)
            note.addEventListener("click", function(e){
                switch(true){
                    case(editMode && !deleteMode && e.target == this):
                        document.getElementById(note.id).style.backgroundColor = 
                        document.getElementById(note.id).style.backgroundColor == dataJSON.allColors[dataJSON.allColors.length - 1] ? 
                        dataJSON.allColors[0] : dataJSON.allColors[dataJSON.allColors.indexOf(document.getElementById(note.id).style.backgroundColor) + 1]
                        break
                    case(deleteMode):
                        if(!dataJSON.notesForDeletion.includes(note.id)){     
                            document.getElementById(note.id).style.border = "1px solid red"
                            document.getElementById(note.id).style.animation = "pulsating 1s infinite"
                            dataJSON.notesForDeletion.push(note.id)
                        }else{
                            document.getElementById(note.id).style.border = "none"
                            document.getElementById(note.id).style.animation = "0"
                            document.getElementById(note.id).style.opacity = "1"
                            dataJSON.notesForDeletion.splice(dataJSON.notesForDeletion.indexOf(note.id), 1)
                        }
                        break
                    default:
                        break
                }
            })
        }
    })
}
function deleteNotes(){
    dataJSON.notesForDeletion.forEach(note => {
        document.getElementById(note).remove()
        localStorage.removeItem(note)
        localStorage.removeItem(`${note}_timePosted`)
    })
    dataJSON.notesForDeletion = []
    updateNoteInformation()
}
function updatePostDateDisplay(noteDate){
    const secDiff = parseInt(((new Date() - new Date(noteDate)) / 1000).toFixed())
    if(secDiff >= 0 && secDiff < 60){ //Seconds
        return `Posted ${secDiff} second${secDiff != 1 ? "s" : ""} ago`
    }
    else if(secDiff >= 60 && secDiff < 3600){ //Minutes
        const min = Math.floor((secDiff / 60))
        return `Posted ${min} minute${min != 1 ? "s" : ""} ago`
    }
    else if(secDiff >= 3600 && secDiff < 86400){ //Hours
        const hr = Math.floor((secDiff / 3600))
        return `Posted ${hr} hour${hr != 1 ? "s" : ""} ago`
    }
    else if(secDiff >= 86400 && secDiff < 604800){ //Days
        const dy = Math.floor((secDiff / 86400))
        return `Posted ${dy} day${dy != 1 ? "s" : ""} ago`
    }
    else if(secDiff >= 604800 && secDiff < 2628000){ //Weeks
        const wk = Math.floor((secDiff / 604800))
        return `Posted ${wk} week${wk != 1 ? "s" : ""} ago`
    }
    else if(secDiff >= 2628000 && secDiff < 31535965){ //Months
        const mth = Math.floor((secDiff / 2628000))
        return `Posted ${mth} month${mth != 1 ? "s" : ""} ago`
    }
    else if(secDiff >= 31535965){ //Years
        const yr = Math.floor((secDiff / 31535965))
        return `Posted ${yr} year${yr != 1 ? "s" : ""} ago`
    }
}
function save(){
    noteList.forEach(note => {
        localStorage.setItem(note.id, document.getElementById(note.id).outerHTML)
        document.getElementById(`${note.id}_timePosted`).innerHTML = updatePostDateDisplay(localStorage.getItem(`${note.id}_timePosted`))
        console.log("Saved:", note.id)
    })
    console.log("Notes in storage:", localStorage.getItem("noteList"))
}
function load(){
    if(localStorage.getItem("noteList") == null || noteList.length == 0){
        document.getElementById("nothing_prompt").style.opacity = "1"
        document.getElementById("nothing_prompt").innerHTML = "Nothing. Click the \"+\" button to create a new note."
    }else{
        console.log("Now loading data...")
        noteList.forEach(note => {
            if(localStorage.getItem(note) == null) return
            console.log(note)
            console.log(localStorage.getItem(note))
            noteDisplaySection.innerHTML += localStorage.getItem(note)
        })
        console.log("Data load complete")
        updateNoteInformation()
    }
}
function clear(){ //Used for dev testing only
    localStorage.clear()
}
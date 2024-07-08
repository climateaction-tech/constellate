// when a user clicks on a tag, emit an event listing the name of the tag being clicked
// this is picked up by the parent component and used to filter the list of profiles
// shown    
document.querySelectorAll('#profile-slot .badge').forEach(item => {
    item.addEventListener('click', event => {
        // we can't just bubble up a 'click' event to the parent elements
        // and use that to update the list of profiles shown, because
        // it won't reflect the updated toggle list of tags yet in the 
        // filter form.
        // So, we have to manually update the list of active tags, and THEN
        // dispatch an event for our filter component to listen for
        let activeTags = document.querySelector('#id_tags')

        // you set a value on a multiple select by setting the 
        //'selected' property of a given option to true
        const selectorString = `#id_tags option[value="${event.target.dataset.tagId}"]`
        const chosenTagOption = document.querySelector(selectorString)
        chosenTagOption.selected = !chosenTagOption.selected

        // once we have updated the option list, we trigger
        // an DOM event our filter component to listen for,
        // and update the list of profiles shown

        document.body.dispatchEvent(new CustomEvent("toggle-tag", { detail: event.target.dataset }))

        // toggle the button active state 
        // TODO: figure out how to persist GET params in the 
        // URL so that we can use active tags to set the 
        // colour of the buttons instead
        event.target.classList.toggle('bg-blue-500')
    })
})

/**
* Clear the profile slot and set the path in the url back to "/", 
* adding the GET params, then the url to the history
*/
function clearProfile() {
    console.log('clearing profile')

    // set the path in the url back to "/", adding the GET params
    // from the current URL
    const currentUrl = new URL(window.location.href)
    const newUrl = new URL('/', window.location.origin)
    newUrl.search = currentUrl.search
    window.history.pushState({}, '', newUrl)

    // then set the profile slot to the empty profile
    const emptyProfile = document.querySelector('#empty-profile').innerHTML
    document.querySelector('#profile-slot .profile').innerHTML = emptyProfile
    htmx.trigger("body", "update-profile")

}
document.querySelector('#clear-profile').addEventListener('click', clearProfile)

document.body.addEventListener("htmx:afterSettle", function (detail) {
    const dialog = detail.target.querySelector('dialog[data-onload-showmodal]');
    if (dialog) {
        dialog.showModal();
        // remove the dialog from the DOM when it's closed
        dialog.addEventListener("close", () => {
            dialog.remove();
        });
    };
});
// close-modal event is triggered when we have a successful update
// to a profile
document.body.addEventListener('close-modal', function () {
    const openDialog = document.querySelector('dialog[open]');

    if (openDialog) {
        openDialog.close();
    }
    // trigger a reload of the profile with a 'save-profile-change'
    //event, this makes sure we have the latest info for the profile
    document.body.dispatchEvent(new CustomEvent("save-profile-change"))
});
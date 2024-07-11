// when a user clicks on a tag, emit an event listing the name of the tag being clicked
// this is picked up by the parent component and used to filter the list of profiles
// shown    


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
    updateProfileBadgeState()


}

if (document.querySelector('#clear-profile')) {
    document.querySelector('#clear-profile').addEventListener('click', clearProfile)
}

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

document.body.addEventListener("htmx:afterSettle", function (detail) {
    const dialog = detail.target.querySelector('dialog[data-onload-showmodal]');
    if (dialog) {
        dialog.showModal();
        // remove the dialog from the DOM when it's closed
        dialog.addEventListener("close", () => {
            dialog.remove();
        });
    };
    console.debug("DOM fully loaded and parsed in HTMX");

    // add click listeners to the badges
    updateProfileBadgeState()
});
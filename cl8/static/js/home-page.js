/**
 * Add a set of event listeners to the active tag list, below the search bar
 * so that clicking on them updates the selected options, and triggers a
 * 'toggle-tag' event, for our form to listen for and request an uploaded
 * list of matching profiles
 */
function addListenersForActiveTags() {
  document
    .querySelectorAll('.search-block .active-tags .badge')
    .forEach((item) => {
      // add a listener to the badge button
      item.addEventListener('click', (event) => {
        // find the option element in the hidden tags field
        const selectorString = `#id_tags option[value="${event.target.dataset.tagId}"]`
        const chosenTagOption = document.querySelector(selectorString)

        // toggle the selected status of the tag
        chosenTagOption.selected = !chosenTagOption.selected

        // announce the toggle event the profile list can listen for it
        // passing along the list of new active tags to that anything listening
        // to the event can update any badges
        toggleEvent = new CustomEvent('toggle-tag', {
          detail: event.target.dataset.tagId,
        })
        document.body.dispatchEvent(toggleEvent)
      })

      // our white cross needs to be clickable too, so we add a listener to
      // that to trigger the same click event
      // TODO: events should bubble up the DOM. Why is it not bubbling, meanin we
      // resort to this hacky behaviour?
      const closeCross = item.parentElement.querySelector('.close-cross')
      closeCross.addEventListener('click', (event) => {
        item.click()
      })
    })
}

/**
 * Toggle the selected status of a tag in response to a click event 
 * on the tag badge.
 * This should update the clicked badge, but also trigger the necessary 
 * changes in the application like the list of profiles, and the state of the
 * search component 
 * */
function toggleTagBadge(event) {
  // we can't just bubble up a 'click' event to the parent elements
  // and use that to update the list of profiles shown, because
  // it won't reflect the updated toggle list of tags yet in the
  // below the search input in the filter form.
  
  // So, we have to manually update the list of active tags, and THEN
  // dispatch an event for our filter component to listen for

  // you set a value on a multiple select by setting the
  //'selected' property of a given option to true
  const selectorString = `#id_tags option[value="${event.target.dataset.tagId}"]`
  const chosenTagOption = document.querySelector(selectorString)
  chosenTagOption.selected = !chosenTagOption.selected

  // once we have updated the option list, we trigger
  // a Custom DOM event for our filter component to listen for,
  // and update the list of profiles shown.
  // We pass along the id of the tag that was toggled to any other allow 
  //   listeners to update the status of any visible tags
  document.body.dispatchEvent(
    new CustomEvent('toggle-tag', { detail: event.target.dataset.tagId })
  )

  // finally, we make sure this badge itself has the correct colouring too
  if (chosenTagOption.selected) {
    event.target.classList.add('bg-blue-500')
  } else {
    event.target.classList.remove('bg-blue-500')
  }
}

function addListenersForTagBadges() {
  document.querySelectorAll('#profile-slot .badge').forEach((item) => {
    // add a listener to the badge button for clicks if there isn't one already
    if (!item.getAttribute('data-hasClickListener')) {
      console.log('adding click listener')
      item.addEventListener('click', toggleTagBadge)
      item.setAttribute('data-hasClickListener', 'true')
    }
  })
}

document.addEventListener('DOMContentLoaded', (event) => {
  console.debug('DOM fully loaded and parsed')
  // htmx.logAll();
})

/*
 * Listen for the profile-tag-created event, when a user updates a entry via htmx,
 * and update the list of options in the hidden tags field.
 * This is needed for adding `addListenersForActiveTags`, which relies on
 * having access to the id of the newly created tag
 */
document.body.addEventListener('profile-tag-created', function (evt) {
  console.debug('profile-tag-created event triggered')
  console.debug({ evt })

  // create an option element with the data from the evt detail {value: '123', text: "tagname"} object:
  const newOption = document.createElement('option')
  newOption.value = evt.detail.value
  newOption.text = evt.detail.text

  // now we want to add this to the list of options in the hidden tags field, using the
  // select API
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/add
  id_tags_SelectElem = document.querySelector('#id_tags')
  id_tags_SelectElem.add(newOption)
})

/**
 * Listen for the update-profile event, triggered by HTMX and update the profile view.
 * Mainly used by touch devices who only have space to either show the list of profiles
 * or only show the profile view.
 */
document.body.addEventListener('update-profile', function (evt) {
  console.debug({ detail: evt.detail })

  const profileSlot = htmx.find('#profile-slot')
  const profileList = htmx.find('.sidebar')

  if (evt.detail.hide_profile_list) {
    console.debug('showing profile, hiding profile list')
    profileSlot.classList.remove('hidden')
    profileList.classList.add('hidden')
  } else {
    console.debug('hiding profile, showing profile list')
    profileSlot.classList.add('hidden')
    profileList.classList.remove('hidden')
  }
})

/**
 * Update the list of active tag badges under the search bar when the list of
 * active tags is updated, before adding their click listeners once again
 *
 */
document.body.addEventListener('active-tags-changed', (event) => {
  console.debug('active-tags-changed')
  console.debug({ event })
  const activeTagsList = document.querySelector(
    '.search-block .active-tags .tag_list'
  )
  if (event.detail.rendered_html) {
    if (activeTagsList) {
      activeTagsList.innerHTML = event.detail.rendered_html
    }
  }
  // we need to add listeners again because the DOM has changed,
  // and the event listeners will have been removed along with
  // the DOM elements
  addListenersForActiveTags()
})

/**
 * Listen for a toggle-tag event triggered by people updating the selection
 * of active tags in the search bar, or by clicking on the tag badges the main
 * region of the page on a profile or the full list of tags when no profile or search
 * terms are selected.
 * Runs through every tag, and it is in the list of active tags, it sets them
 * to show as active
 *
 */
document.body.addEventListener('toggle-tag', (event) => {
  console.log({ event })
  console.log({ detail: event.detail })

  var tags = new URLSearchParams(new URL(window.location.href).search).getAll(
    'tags'
  )
  console.log({ tags })

  if (tags.includes(event.detail)) {
    // remove the tag from tags
    tags = tags.filter((tag) => tag !== event.detail)
  }
  document.querySelectorAll('#profile-slot .badge').forEach((item) => {
    const tagId = item.getAttribute('data-tag-id')

    
    // if tagId is in the tag list, set the button to active
    if (tags.includes(tagId)) {
      item.classList.add('bg-blue-500')
    } else {
      item.classList.remove('bg-blue-500')
    }
  })
})

// get the list of tags from the URL
// TODO: we refer to this list of tags when handling the toggle-tag event
//
var tags = new URLSearchParams(new URL(window.location.href).search).getAll(
  'tags'
)

addListenersForActiveTags()

addListenersForTagBadges()

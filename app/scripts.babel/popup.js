'use strict';

function save(e, update = false) {
  const title = document.getElementById('name').value
  const code = document.getElementById('code').value
  const codeId = document.getElementById('codeId').value

  if (!title || !code) {
    alert('You have to set title and code!')
    document.getElementById('name').focus()
    return
  }

  chrome.storage.local.get('codes', (results) => {
    let {codes} = results
    codes = codes || []

    if (update) {
      codes[codeId] = {title, code}
    } else {
      codes.push({title, code})
    }

    chrome.storage.local.set({codes}, () => {
      document.getElementById('name').value = ''
      document.getElementById('code').value = ''
      document.getElementById('codeId').value = ''
      document.getElementById('update').className = 'hidden'

      reloadFromStorage()
    })
  })
}

function update(e) {
  save(e, true)
}

function cancel() {
  document.getElementById('name').value = ''
  document.getElementById('code').value = ''
  document.getElementById('codeId').value = ''
  document.getElementById('update').className = 'hidden'
}

function codeClick(code) {
  return (e) => {
    e.preventDefault()

    const {code: executableCode} = code
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.executeScript(tabs[0].id, {
          code: executableCode,
        });
      }
    });
  }
}

function removeClick(index) {
  return (e) => {
    e.preventDefault()

    if (confirm('Are you sure to delete code?')) {
      chrome.storage.local.get('codes', (results) => {
        let {codes} = results
        codes = codes || []
        codes.splice(index, 1)
        chrome.storage.local.set({codes}, reloadFromStorage)
      })
    }
  }
}

function editClick(index) {
  return (e) => {
    e.preventDefault()

    chrome.storage.local.get('codes', (results) => {
      const {codes} = results
      const selected = codes[index]

      document.getElementById('name').value = selected.title
      document.getElementById('code').value = selected.code
      document.getElementById('codeId').value = index
      document.getElementById('update').className = ''
    })
  }
}

function reloadFromStorage() {
  chrome.storage.local.get('codes', (results) => {
    const {codes} = results

    if (codes) {
      const ul = document.getElementById('scripts')

      while (ul.firstChild) {
        ul.removeChild(ul.firstChild)
      }

      codes.forEach((code, i) => {
        const {
          title: codeTitle,
        } = code

        const li = document.createElement('li')
        const title = document.createElement('a')
        const edit = document.createElement('button')
        const remove = document.createElement('button')

        title.text = codeTitle
        title.addEventListener('click', codeClick(code))
        title.href = '#'

        edit.innerHTML = '[edit]'
        edit.addEventListener('click', editClick(i))

        remove.innerHTML = '[x]'
        remove.addEventListener('click', removeClick(i))

        li.appendChild(title)
        li.appendChild(edit)
        li.appendChild(remove)
        ul.appendChild(li)
      })
    }
  })
}

function init() {
  reloadFromStorage()
  const updateBtn = document.getElementById('update')
  const newBtn = document.getElementById('add-new')
  const cancelBtn = document.getElementById('cancel')

  updateBtn.addEventListener('click', update)
  newBtn.addEventListener('click', save)
  cancelBtn.addEventListener('click', cancel)
}

init()

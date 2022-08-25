document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('form').addEventListener('submit', function () {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });
  })

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-details').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      for (let email of emails) {
        const div = document.createElement('div');
        div.classList.add('flex');
        const leftDiv = document.createElement('div');
        const rightDiv = document.createElement('div');
        div.append(leftDiv, rightDiv);

        leftDiv.classList.add('flex-left');
        const sender = document.createElement('strong');
        if (mailbox === 'sent') {
          sender.append(email.recipients);
        }
        else {
          sender.append(email.sender);
        }
        const body = document.createElement('div');
        body.append(email.body)
        leftDiv.append(sender, body)

        rightDiv.classList.add('flex-right');
        rightDiv.append(email.timestamp);

        if (email.read === false) {
          div.style.backgroundColor = 'rgb(234, 236, 239)';
        }

        document.querySelector('#emails-view').append(div);

        div.addEventListener('click', function () {
          fetch(`/emails/${email.id}`)
            .then(response => response.json())
            .then(email => {
              // Print email
              console.log(email);

              // ... do something else with email ...
              document.querySelector('#emails-details').style.display = 'block';
              document.querySelector('#compose-view').style.display = 'none';
              document.querySelector('#emails-view').style.display = 'none';

              // container.remove();

              const from = document.createElement('p');
              from.innerHTML = `<strong>From: </strong>${email.sender}`;

              const to = document.createElement('p');
              to.innerHTML = `<strong>To: </strong>${email.recipients}`;

              const subject = document.createElement('p');
              subject.innerHTML = `<strong>Subject: </strong>${email.subject}`;

              const timestamp = document.createElement('p');
              timestamp.innerHTML = `<strong>Timestamp: </strong>${email.timestamp}`;

              const reply = document.createElement('button');
              reply.innerHTML = 'Reply';
              reply.className = 'btn btn-sm btn-outline-primary';
              reply.addEventListener('click', () => {
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'block';
                document.querySelector('#emails-details').style.display = 'none';

                document.querySelector('#compose-recipients').value = email.sender;
                document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
                document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: (${email.body}) - reply: `;

              })
              const archive = document.createElement('button');
              if (mailbox === 'archive') {
                archive.innerHTML = 'Unarchive';
                archive.className = 'btn btn-sm btn-outline-secondary';
                archive.addEventListener('click', () => {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                      archived: false
                    })
                  })
                })
              }
              if (mailbox === 'inbox') {
                archive.innerHTML = 'Archive';
                archive.className = 'btn btn-sm btn-outline-secondary';
                archive.addEventListener('click', () => {
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                      archived: true
                    })
                  })
                })
              }

              const btns = document.createElement('div');
              btns.append(reply, archive);
              btns.classList.add('flex-left')

              const hr = document.createElement('hr');

              const body = document.createElement('p');
              body.innerHTML = `${email.body}`;

              const container = document.createElement('div');
              if (mailbox === 'sent') {
                container.append(from, to, subject, timestamp, hr, body);
                document.querySelector('#emails-details').append(container);
              } else {
                container.append(from, to, subject, timestamp, btns, hr, body);
                document.querySelector('#emails-details').append(container);
              }

              document.querySelector('#inbox').addEventListener('click', () => {
                container.remove();
              });
              document.querySelector('#sent').addEventListener('click', () => {
                container.remove();
              });
              document.querySelector('#archived').addEventListener('click', () => {
                container.remove();
              });

              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  read: true
                })
              })
            });
        })
      }
    });
}
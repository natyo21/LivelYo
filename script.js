function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.style.display = 'none');

  const target = document.getElementById(id);
  if (target) target.style.display = 'block';
}

// Firebase config (เปลี่ยนค่าตามโปรเจ็กต์จริง)
const firebaseConfig = {
  apiKey: "AIzaSyAwa-CYL5aQ33BbTWpm7mZ3LdE0hmceacE",
  authDomain: "natyo21.firebaseapp.com",
  projectId: "natyo21",
  storageBucket: "natyo21.firebasestorage.app",
  messagingSenderId: "893447272111",
  appId: "1:893447272111:web:e54b15aa631da96ad9065a",
  measurementId: "G-MZ3FF45KFB"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// โหลดโพสต์ทั้งหมดแบบ real-time
function loadPosts() {
  db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    const container = document.getElementById('postContainer');
    container.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const post = document.createElement('div');
      post.className = 'post';
      post.innerHTML = `
        ${data.image ? `<img src="${data.image}" alt="user-img" class="user-img" />` : `<div class="user-img" style="background:#aaa; text-align:center; line-height:60px; color:white;">image</div>`}
        <div class="post-content">
          <div class="message-text">${escapeHtml(data.text)}</div>
          <div class="timestamp">${data.time}</div>
        </div>
      `;
      container.appendChild(post);
    });
  });
}
loadPosts();

window.addEventListener('DOMContentLoaded', function() {
  const postInput = document.getElementById('postInput');
  if (postInput) {
    // ดึงข้อความที่ยังไม่ได้โพสต์จาก LocalStorage
    const savedText = localStorage.getItem('pendingPostText');
    if (savedText) {
      postInput.value = savedText;
    }
    // บันทึกข้อความทุกครั้งที่พิมพ์
    postInput.addEventListener('input', function() {
      localStorage.setItem('pendingPostText', postInput.value);
    });
  }
});

function addPost() {
  const input = document.getElementById('postInput');
  const text = input.value.trim();
  const imgInput = document.getElementById('imageInput');
  if (text === '') {
    alert('Please write something before posting.');
    return;
  }
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour12: false });
  const dateString = now.toLocaleDateString('en-US');
  const fullDateTime = `${timeString} - ${dateString}`;
  const file = imgInput.files[0];
  // Play cute sound
  const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae7c2.mp3');
  audio.volume = 0.5;
  audio.play();
  // Animate post button
  const postBtn = document.getElementById('postBtn');
  postBtn.classList.add('post-animate');
  setTimeout(() => postBtn.classList.remove('post-animate'), 600);
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      db.collection('posts').add({
        text,
        image: e.target.result,
        time: fullDateTime,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      input.value = '';
      imgInput.value = '';
      document.getElementById('previewImage').style.display = 'none';
      localStorage.removeItem('pendingPostText'); // ลบข้อความที่บันทึกไว้หลังโพสต์
    };
    reader.readAsDataURL(file);
  } else {
    db.collection('posts').add({
      text,
      image: '',
      time: fullDateTime,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = '';
    imgInput.value = '';
    document.getElementById('previewImage').style.display = 'none';
    localStorage.removeItem('pendingPostText'); // ลบข้อความที่บันทึกไว้หลังโพสต์
  }
}

// ป้องกันโค้ดแปลกๆ จากการพิมพ์ (XSS)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

document.getElementById('imageInput').addEventListener('change', function(e) {
  const preview = document.getElementById('previewImage');
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      preview.src = ev.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = '';
    preview.style.display = 'none';
  }
});

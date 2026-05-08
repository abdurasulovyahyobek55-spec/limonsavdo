import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminPassword = document.getElementById('adminPassword');

// Auth (Simple logic for demo, should use Firebase Auth in production)
loginBtn.addEventListener('click', () => {
    if (adminPassword.value === 'admin123') {
        sessionStorage.setItem('isAdmin', 'true');
        showDashboard();
    } else {
        alert('Parol noto\'g\'ri!');
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isAdmin');
    location.reload();
});

function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadAdminProducts();
}

if (sessionStorage.getItem('isAdmin') === 'true') {
    showDashboard();
}

// Image handling
const imagePreview = document.getElementById('imagePreview');
const productImage = document.getElementById('productImage');
let selectedImageData = '';

imagePreview.addEventListener('click', () => productImage.click());

productImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedImageData = event.target.result;
            imagePreview.innerHTML = `<img src="${selectedImageData}">`;
        };
        reader.readAsDataURL(file);
    }
});

// CRUD Operations
const addBtn = document.getElementById('addBtn');
const adminProductList = document.getElementById('adminProductList');

addBtn.addEventListener('click', async () => {
    const name = document.getElementById('productName').value;
    const desc = document.getElementById('productDesc').value;
    const price = document.getElementById('productPrice').value;

    if (!name || !desc) return alert('Barcha maydonlarni to\'ldiring!');

    try {
        await addDoc(collection(db, "products"), {
            name,
            description: desc,
            price,
            image: selectedImageData,
            createdAt: new Date().toISOString()
        });
        alert('Mahsulot qo\'shildi!');
        resetForm();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
});

function resetForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productPrice').value = '';
    imagePreview.innerHTML = '<i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; color: var(--text-muted);"></i>';
    selectedImageData = '';
}

function loadAdminProducts() {
    onSnapshot(collection(db, "products"), (snapshot) => {
        adminProductList.innerHTML = '';
        snapshot.forEach((doc) => {
            const product = doc.data();
            const div = document.createElement('div');
            div.className = 'product-card';
            div.style.marginBottom = '1rem';
            div.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${product.image}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0;">${product.name}</h4>
                        <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">${product.price}</p>
                    </div>
                    <button class="btn btn-sm" style="background: #fee2e2; color: #dc2626;" onclick="deleteProduct('${doc.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            adminProductList.appendChild(div);
        });
    });
}

window.deleteProduct = async (id) => {
    if (confirm('O\'chirmoqchimisiz?')) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    }
};

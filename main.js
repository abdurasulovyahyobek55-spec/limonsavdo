import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, onSnapshot } from "firebase/firestore";

// Firebase Configuration (User needs to fill this)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Products Logic ---
const productsList = document.getElementById('productsList');

async function loadProducts() {
    try {
        // Real-time listener for products
        onSnapshot(collection(db, "products"), (snapshot) => {
            productsList.innerHTML = '';
            if (snapshot.empty) {
                productsList.innerHTML = '<p class="empty-msg">Hozircha mahsulotlar yo\'q.</p>';
                return;
            }
            snapshot.forEach((doc) => {
                const product = doc.data();
                const card = createProductCard(product);
                productsList.appendChild(card);
            });
        });
    } catch (error) {
        console.error("Error loading products:", error);
        productsList.innerHTML = '<p class="error-msg">Ma\'lumotlarni yuklashda xatolik yuz berdi.</p>';
    }
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-img">
            ${product.image ? `<img src="${product.image}" alt="${product.name}">` : `<i class="fa-solid fa-seedling"></i>`}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-meta">
                <span class="price">${product.price || 'Kelishiladi'}</span>
                <button class="btn btn-sm btn-primary" onclick="window.location.href='https://t.me/limonsavdo_bot'">Bog'lanish</button>
            </div>
        </div>
    `;
    return div;
}

// --- Advisor Logic ---
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

const knowledgeBase = {
    suv: "Limon namlikni yaxshi ko'radi. Yozda haftada 1-2 marta sug'orish tavsiya etiladi.",
    ogit: "Azotli va fosforli o'g'itlar limon uchun juda muhim. Bahorda go'ng berish foydali.",
    kasallik: "Barglar sarg'ayishi xloroz bo'lishi mumkin. Temir preparatlari bilan ishlov bering.",
    harorat: "Limon +18...+25 darajani yaxshi ko'radi. Qishda +5 dan pastga tushmasligi kerak.",
    default: "Kechirasiz, bu haqda ma'lumotim yo'q. Mutaxassis bilan bog'laning: +998 94 170 68 79"
};

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleQuery() {
    const text = userInput.value.trim().toLowerCase();
    if (!text) return;

    addMessage(userInput.value, 'user');
    userInput.value = '';

    let response = knowledgeBase.default;
    if (text.includes('suv') || text.includes('sug\'orish') || text.includes('namlik')) response = knowledgeBase.suv;
    else if (text.includes('o\'g\'it') || text.includes('dori') || text.includes('oziqlantirish')) response = knowledgeBase.ogit;
    else if (text.includes('kasal') || text.includes('sarg\'ayish') || text.includes('shira') || text.includes('qurt')) response = knowledgeBase.kasallik;
    else if (text.includes('harorat') || text.includes('issiq') || text.includes('sovuq') || text.includes('muzlash')) response = knowledgeBase.harorat;

    setTimeout(() => {
        addMessage(response, 'system');
    }, 500);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    
    sendBtn?.addEventListener('click', handleQuery);
    userInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuery();
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
});

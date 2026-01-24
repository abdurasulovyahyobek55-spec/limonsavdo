// Knowledge Base for the Expert System
const knowledgeBase = {
    suv: "Limon namlikni yaxshi ko'radi. Yozda tuproq holatidan kelib chiqib haftada 1-2 marta , qishda mavsumida chilla suvi beriladi yer namligiga qarab. ",
    ogit: "Azotli va fosforli o'g'itlar limon uchun juda muhim. Bahorda go'ng, yoz davomida esa mineral o'g'itlar bilan oziqlantiring. Bargidan oziqlantirish ham yaxshi samara beradi.",
    kasallik: "Limon barglarida sarg'ayish bo'lsa, bu temir yetishmovchiligi (xloroz) bo'lishi mumkin. O'rgimchak kana va shira tushishidan ehtiyot bo'ling. Profilaktika uchun Bordo suyuqligidan foydalaning.Yoz mavsumida bargiga tushadiga rassom qurtga qarshi VERTIMEK preparadi yaxshi samara beradi.",
    harorat: "Limon subtropik o'simlik. Qishda harorat +5 gradusdan tushib ketmasligi kerak. Eng qulay harorat +18...+25 daraja. Sovuq urishidan asrash uchun qishda issiqxonani yaxshilab yoping.",
    default: "Uzr, bu savolga aniq javob topa olmadim. Iltimos, savolingizni boshqacha shakllantiring yoki biz bilan bog'laning: +998 94 170 68 79 / +998 93 101 68 79"
};

// Chat Functions
function askQuestion(topic) {
    // Add user message (visual only, for chip clicks we can skip or show what they clicked)
    addMessage(getErrorText(topic), 'user');

    // Simulate typing delay
    setTimeout(() => {
        const response = knowledgeBase[topic] || knowledgeBase.default;
        addMessage(response, 'system');
    }, 500);
}

function getErrorText(topic) {
    const map = {
        'suv': 'Sug\'orish tartibi qanday?',
        'ogit': 'Qanday o\'g\'itlar kerak?',
        'kasallik': 'Kasalliklarga qarshi nima qilish kerak?',
        'harorat': 'Harorat qanday bo\'lishi kerak?'
    };
    return map[topic] || topic;
}

function handleUserQuery() {
    const input = document.getElementById('userInput');
    const text = input.value.trim().toLowerCase();

    if (text === "") return;

    addMessage(input.value, 'user');
    input.value = "";

    // Simple Keyword Matching Algorithm
    let response = knowledgeBase.default;

    if (text.includes('suv') || text.includes('sug\'orish') || text.includes('namlik')) {
        response = knowledgeBase.suv;
    } else if (text.includes('o\'g\'it') || text.includes('dori') || text.includes('ozuq')) {
        response = knowledgeBase.ogit;
    } else if (text.includes('kasal') || text.includes('sarg\'ayish') || text.includes('kana')) {
        response = knowledgeBase.kasallik;
    } else if (text.includes('harorat') || text.includes('issiq') || text.includes('sovuq')) {
        response = knowledgeBase.harorat;
    } else if (text.includes('narx') || text.includes('qancha')) {
        response = "Narxlarimizni bilish va xarid qilish uchun biz bilan bog'laning.";
    }

    setTimeout(() => {
        addMessage(response, 'system');
    }, 500);
}

function addMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.classList.add('message', sender === 'user' ? 'user-message' : 'system-message');
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Order Function
// Product & Admin Logic

// Load products when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the main page or admin page
    if (document.getElementById('productsList')) {
        loadProducts();
    }

    // Previous event listeners...
    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (menuBtn) {
        // ... (existing helper logic would be here, but we are inside the bigger function block in the original file, 
        // actually wait, this logic is duplicating. I need to be careful not to overwrite the other listeners.
        // The original file had DOMContentLoaded handling menu. I will integrate properly.)
    }
});

function loadProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;

    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');

    // If we have saved products, clear the defaults and show saved ones
    // If NO saved products, we leave the HTML default ones alone (fallback)
    if (savedProducts.length > 0) {
        container.innerHTML = ''; // Clear defaults
        savedProducts.forEach(product => {
            const card = createProductCard(product);
            container.innerHTML += card;
        });
    }
}

function createProductCard(product) {
    // If image is base64, use it. If not, use icon as fallback
    let imgDisplay = product.image ?
        `<img src="${product.image}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">` :
        `<i class="fa-solid fa-lemon"></i>`;

    return `
    <div class="product-card">
        <div class="product-img">
            ${imgDisplay}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <button class="btn btn-sm" onclick="showContactModal('${product.name}')">Aloqaga chiqish</button>
        </div>
    </div>
    `;
}

// Contact Modal Logic
function showContactModal(productName) {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'flex';
        // Optional: Update modal text to reference the specific product
    } else {
        // Fallback if modal html isn't present
        alert("Sotib olish bo'yicha bog'lanish:\nTel: +998 94 170 68 79\nTel: +998 93 101 68 79");
    }
}

function closeModal(e) {
    if (e.target.classList.contains('modal-overlay') || e.target.tagName === 'BUTTON') {
        document.getElementById('contactModal').style.display = 'none';
    }
}


// --- ADMIN FUNCTIONS ---

function adminLogin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === 'admin123' || pass === '1234') { // Simple demo password
        localStorage.setItem('isAdmin', 'true');
        location.reload();
    } else {
        alert("Parol noto'g'ri!");
    }
}

function logout() {
    localStorage.removeItem('isAdmin');
    location.reload();
}

function previewImage(input) {
    const file = input.files[0];
    if (file) {
        // Check size (limit to 2MB for localStorage safety)
        if (file.size > 2000000) {
            alert("Rasm hajmi juda katta! Iltimos, 2MB dan kichik rasm yuklang.");
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}">`;
            document.getElementById('imagePreview').dataset.base64 = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function addProduct() {
    const name = document.getElementById('productName').value;
    const desc = document.getElementById('productDesc').value;
    const imgData = document.getElementById('imagePreview').dataset.base64 || '';

    if (!name || !desc) {
        alert("Iltimos, mahsulot nomi va tavsifini kiriting!");
        return;
    }

    const newProduct = {
        id: Date.now(),
        name: name,
        description: desc,
        image: imgData,
        date: new Date().toISOString()
    };

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    alert("E'lon muvaffaqiyatli joylandi!");
    // Reset form
    document.getElementById('productName').value = '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('imagePreview').innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i>';

    // Refresh list
    loadAdminProducts();
}

function loadAdminProducts() {
    const container = document.getElementById('adminProductList');
    if (!container) return;

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">Hozircha e\'lonlar yo\'q.</p>';
        return;
    }

    products.forEach(product => {
        let imgDisplay = product.image ?
            `<img src="${product.image}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">` :
            `<i class="fa-solid fa-lemon" style="font-size:3rem;"></i>`;

        container.innerHTML += `
        <div class="product-card" style="position:relative;">
            <button onclick="deleteProduct(${product.id})" style="position:absolute; top:10px; right:10px; background:red; color:white; border:none; width:30px; height:30px; border-radius:50%; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            <div class="product-img" style="height:150px;">
                ${imgDisplay}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p style="font-size:0.8rem">${product.description.substring(0, 50)}...</p>
            </div>
        </div>
        `;
    });
}

function deleteProduct(id) {
    if (confirm("Rostdan ham bu e'lonni o'chirmoqchimisiz?")) {
        let products = JSON.parse(localStorage.getItem('products') || '[]');
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        loadAdminProducts();
    }
}


// Navigation & Interactive UI
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'white';
            navLinks.style.padding = '20px';
            navLinks.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
        }
    });

    // Enter key support for chat
    document.getElementById('userInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleUserQuery();
        }
    });
});


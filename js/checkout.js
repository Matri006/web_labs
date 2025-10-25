
const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
const API_KEY = '6d6ddfc6-d9b7-4f06-afe9-f6cd1194c183'; 

let currentOrder = {};
let dishesData = {};

function loadOrderFromStorage() {
    const savedOrder = localStorage.getItem('foodConstructOrder');
    if (savedOrder) {
        try {
            const orderData = JSON.parse(savedOrder);
            console.log('Загружен заказ из localStorage:', orderData);
            return orderData;
        } catch (e) {
            console.error('Ошибка парсинга заказа:', e);
        }
    }
    return { selectedDishes: {}, dishesData: {} };
}

async function loadAllDishes() {
    try {
        const response = await fetch(`${API_URL}/labs/api/dishes?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Ошибка загрузки блюд');
        const dishes = await response.json();
      
        const dishesMap = {};
        dishes.forEach(dish => {
            dishesMap[dish.id] = dish;
        });
        
        return dishesMap;
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Ошибка загрузки данных с сервера');
        return {};
    }
}

async function displayOrderItems() {
    const orderItemsContainer = document.getElementById('order-items');
    const emptyOrderDiv = document.getElementById('empty-order');
    const totalPriceElement = document.getElementById('total-price');
    const submitButton = document.getElementById('submit-order-btn');

    if (!orderItemsContainer || !emptyOrderDiv || !totalPriceElement) {
        console.error('Не найдены элементы для отображения заказа');
        return;
    }

    orderItemsContainer.innerHTML = '';

    let totalPrice = 0;
    let hasItems = false;

    const allDishes = await loadAllDishes();
    
    console.log('Текущий заказ:', currentOrder.selectedDishes);
    console.log('Данные блюд:', currentOrder.dishesData);

    if (currentOrder.selectedDishes) {
        Object.keys(currentOrder.selectedDishes).forEach(category => {
            const dishId = currentOrder.selectedDishes[category];
            
            if (dishId) {
    
                let dish = allDishes[dishId] || 
                          currentOrder.dishesData[dishId] || 
                          findDishInStoredData(dishId);
                
                if (dish) {
                    const dishElement = createDishElement(dish, category);
                    orderItemsContainer.appendChild(dishElement);
                    totalPrice += parseInt(dish.price) || 0;
                    hasItems = true;
                    console.log(`Отображено блюдо: ${dish.name} за ${dish.price} руб.`);
                } else {
                    console.warn(`Блюдо с ID ${dishId} не найдено`);
                }
            }
        });
    }
    if (hasItems) {
        orderItemsContainer.style.display = 'block';
        emptyOrderDiv.style.display = 'none';
        if (submitButton) submitButton.disabled = false;
    } else {
        orderItemsContainer.style.display = 'none';
        emptyOrderDiv.style.display = 'block';
        if (submitButton) submitButton.disabled = true;
    }

    totalPriceElement.textContent = totalPrice;
    console.log(`Итоговая сумма: ${totalPrice} руб.`);
}

function findDishInStoredData(dishId) {
    if (currentOrder.dishesData && currentOrder.dishesData[dishId]) {
        return currentOrder.dishesData[dishId];
    }
    
    if (dishesData && dishesData[dishId]) {
        return dishesData[dishId];
    }
    
    return null;
}

function createDishElement(dish, category) {
    const dishDiv = document.createElement('div');
    dishDiv.className = 'order-item';
    dishDiv.innerHTML = `
        <div class="order-item-info">
            <img src="${dish.image || './images/placeholder.jpg'}" alt="${dish.name || 'Блюдо'}" 
                 onerror="this.src='./images/placeholder.jpg'">
            <div class="order-item-details">
                <h4>${getCategoryName(category)}: ${dish.name || 'Неизвестное блюдо'}</h4>
                <p>${dish.count || ''}</p>
                <span class="order-item-price">${dish.price || 0} ₽</span>
            </div>
        </div>
        <button class="remove-btn" data-category="${category}">Удалить</button>
    `;
    return dishDiv;
}

function getCategoryName(category) {
    const names = {
        'soup': 'Суп',
        'main-course': 'Главное блюдо',
        'drink': 'Напиток',
        'salad': 'Салат',
        'dessert': 'Десерт'
    };
    return names[category] || category;
}

function removeFromOrder(category) {
    if (currentOrder.selectedDishes) {
        delete currentOrder.selectedDishes[category];
        localStorage.setItem('foodConstructOrder', JSON.stringify(currentOrder));
        displayOrderItems();
    }
}

function validateForm(formData) {
    const errors = [];
    if (!formData.get('full_name')?.trim()) errors.push('Укажите ФИО');
    if (!formData.get('email')?.trim()) errors.push('Укажите email');
    if (!formData.get('phone')?.trim()) errors.push('Укажите телефон');
    if (!formData.get('delivery_address')?.trim()) errors.push('Укажите адрес доставки');
    if (!formData.get('delivery_type')) errors.push('Выберите тип доставки');
    if (formData.get('delivery_type') === 'by_time') {
        const deliveryTime = formData.get('delivery_time');
        if (!deliveryTime) {
            errors.push('Укажите время доставки');
        } else {
            const now = new Date();
            const selectedTime = new Date();
            const [hours, minutes] = deliveryTime.split(':');
            selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (selectedTime < now) {
                errors.push('Время доставки не может быть раньше текущего времени');
            }
        }
    }
    if (!validateCombo(currentOrder.selectedDishes || {})) {
        errors.push('Выбранные блюда не соответствуют ни одному из доступных комбо');
    }

    return errors;
}
function validateCombo(order) {
    const hasSoup = !!order.soup;
    const hasMain = !!order["main-course"];
    const hasSalad = !!order.salad;
    const hasDrink = !!order.drink;

    const validCombos = [
        { soup: true, main: true, salad: true, drink: true },
        { soup: true, main: true, salad: false, drink: true },
        { soup: true, main: false, salad: true, drink: true },
        { soup: false, main: true, salad: true, drink: true },
        { soup: false, main: true, salad: false, drink: true }
    ];

    return validCombos.some(combo => 
        combo.soup === hasSoup &&
        combo.main === hasMain &&
        combo.salad === hasSalad &&
        combo.drink === hasDrink
    );
}

async function submitOrder(orderData) {
    try {
        console.log('Отправка заказа на сервер:', orderData);
        
        const response = await fetch(`${API_URL}/labs/api/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка отправки заказа:', error);
        throw error;
    }
}
function showError(message) {
    alert('Ошибка: ' + message);
}

function showSuccess(message) {
    alert('Успех: ' + message);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация страницы оформления заказа');
    currentOrder = loadOrderFromStorage();
    console.log('Загруженный заказ:', currentOrder);
    const deliveryTypeRadios = document.querySelectorAll('input[name="delivery_type"]');
    const deliveryTimeGroup = document.getElementById('delivery-time-group');

    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (deliveryTimeGroup) {
                deliveryTimeGroup.style.display = this.value === 'by_time' ? 'block' : 'none';
            }
        });
    });
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const category = e.target.getAttribute('data-category');
            if (confirm('Удалить это блюдо из заказа?')) {
                removeFromOrder(category);
            }
        }
    });
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Отправка формы оформления заказа');

            const submitButton = document.getElementById('submit-order-btn');
            if (submitButton) submitButton.disabled = true;

            const formData = new FormData(this);
            const errors = validateForm(formData);
            if (errors.length > 0) {
                showError(errors.join('\n'));
                if (submitButton) submitButton.disabled = false;
                return;
            }
            const orderData = {
                full_name: formData.get('full_name').trim(),
                email: formData.get('email').trim(),
                phone: formData.get('phone').trim(),
                delivery_address: formData.get('delivery_address').trim(),
                delivery_type: formData.get('delivery_type'),
                subscribe: formData.get('subscribe') === '1',
                comment: formData.get('comment')?.trim() || ''
            };
            if (orderData.delivery_type === 'by_time') {
                orderData.delivery_time = formData.get('delivery_time');
            }
            if (currentOrder.selectedDishes) {
                Object.keys(currentOrder.selectedDishes).forEach(category => {
                    const dishId = currentOrder.selectedDishes[category];
                    if (dishId) {
                        const fieldName = category === 'main-course' ? 'main_course_id' : `${category}_id`;
                        orderData[fieldName] = parseInt(dishId);
                    }
                });
            }

            console.log('Данные для отправки:', orderData);

            try {
                const result = await submitOrder(orderData);
                showSuccess('Заказ успешно оформлен! Номер вашего заказа: ' + (result.id || 'неизвестен'));
                localStorage.removeItem('foodConstructOrder');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
                
            } catch (error) {
                console.error('Ошибка оформления заказа:', error);
                showError(`Ошибка оформления заказа: ${error.message}`);
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
    displayOrderItems();
});
const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
const API_KEY = '6d6ddfc6-d9b7-4f06-afe9-f6cd1194c183';

let allOrders = [];
let allDishes = [];
let currentOrderToDelete = null;
async function loadOrders() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/labs/api/orders?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки заказов');
        }
        
        const orders = await response.json();
    
        allOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        await loadDishes();
        
        displayOrders();
        
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        showNotification('Ошибка загрузки заказов: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}
async function loadDishes() {
    try {
        const response = await fetch(`${API_URL}/labs/api/dishes?api_key=${API_KEY}`);
        if (response.ok) {
            allDishes = await response.json();
        }
    } catch (error) {
        console.error('Ошибка загрузки блюд:', error);
    }
}
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    const emptyOrders = document.getElementById('empty-orders');
    
    if (allOrders.length === 0) {
        ordersList.style.display = 'none';
        emptyOrders.style.display = 'block';
        return;
    }
    
    ordersList.style.display = 'block';
    emptyOrders.style.display = 'none';
    
    ordersList.innerHTML = '';
    
    allOrders.forEach((order, index) => {
        const orderElement = createOrderElement(order, index + 1);
        ordersList.appendChild(orderElement);
    });
}
function createOrderElement(order, orderNumber) {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';
    orderDiv.innerHTML = `
        <div class="order-header">
            <div class="order-number">#${orderNumber}</div>
            <div class="order-date">${formatDate(order.created_at)}</div>
        </div>
        
        <div class="order-content">
            <div class="order-dishes">
                <strong>Состав:</strong> ${getOrderDishesText(order)}
            </div>
            
            <div class="order-info">
                <div class="order-price">
                    <strong>Стоимость:</strong> ${calculateOrderTotal(order)} ₽
                </div>
                <div class="order-delivery-time">
                    <strong>Время доставки:</strong> ${getDeliveryTimeText(order)}
                </div>
            </div>
        </div>
        
        <div class="order-actions">
            <button class="btn-icon view-order-btn" data-order-id="${order.id}" title="Подробнее">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn-icon edit-order-btn" data-order-id="${order.id}" title="Редактировать">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-icon delete-order-btn" data-order-id="${order.id}" title="Удалить">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    return orderDiv;
}
function getOrderDishesText(order) {
    const dishNames = [];
    
    if (order.soup_id) {
        const dish = allDishes.find(d => d.id === order.soup_id);
        dishNames.push(dish ? dish.name : 'Суп');
    }
    
    if (order.main_course_id) {
        const dish = allDishes.find(d => d.id === order.main_course_id);
        dishNames.push(dish ? dish.name : 'Главное блюдо');
    }
    
    if (order.salad_id) {
        const dish = allDishes.find(d => d.id === order.salad_id);
        dishNames.push(dish ? dish.name : 'Салат');
    }
    
    if (order.drink_id) {
        const dish = allDishes.find(d => d.id === order.drink_id);
        dishNames.push(dish ? dish.name : 'Напиток');
    }
    
    if (order.dessert_id) {
        const dish = allDishes.find(d => d.id === order.dessert_id);
        dishNames.push(dish ? dish.name : 'Десерт');
    }
    
    return dishNames.length > 0 ? dishNames.join(', ') : 'Блюда не выбраны';
}
function calculateOrderTotal(order) {
    let total = 0;
    
    [order.soup_id, order.main_course_id, order.salad_id, order.drink_id, order.dessert_id].forEach(dishId => {
        if (dishId) {
            const dish = allDishes.find(d => d.id === dishId);
            if (dish && dish.price) {
                total += parseInt(dish.price);
            }
        }
    });
    
    return total;
}
function getDeliveryTimeText(order) {
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        return formatTime(order.delivery_time);
    } else {
        return 'Как можно скорее (с 7:00 до 23:00)';
    }
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}
function showLoading(show) {
    const loadingMessage = document.getElementById('loading-message');
    const ordersContainer = document.getElementById('orders-container');
    
    if (loadingMessage) {
        loadingMessage.style.display = show ? 'block' : 'none';
    }
    
    if (ordersContainer) {
        ordersContainer.style.display = show ? 'none' : 'block';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
}
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeAllModals() {
    closeModal('order-details-modal');
    closeModal('edit-order-modal');
    closeModal('delete-order-modal');
}
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('order-details-content');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="order-detail-section">
                <h3>Информация о заказе</h3>
                <p><strong>Номер заказа:</strong> #${order.id}</p>
                <p><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</p>
                <p><strong>Статус:</strong> ${order.status || 'Обработан'}</p>
            </div>
            
            <div class="order-detail-section">
                <h3>Состав заказа</h3>
                ${getOrderDishesHTML(order)}
            </div>
            
            <div class="order-detail-section">
                <h3>Информация о доставке</h3>
                <p><strong>ФИО:</strong> ${order.full_name}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Телефон:</strong> ${order.phone}</p>
                <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
                <p><strong>Тип доставки:</strong> ${order.delivery_type === 'by_time' ? 'К указанному времени' : 'Как можно скорее'}</p>
                ${order.delivery_type === 'by_time' && order.delivery_time ? 
                  `<p><strong>Время доставки:</strong> ${formatTime(order.delivery_time)}</p>` : ''}
                ${order.comment ? `<p><strong>Комментарий:</strong> ${order.comment}</p>` : ''}
            </div>
            
            <div class="order-detail-section">
                <h3>Стоимость</h3>
                <p class="order-total-price">Итого: ${calculateOrderTotal(order)} ₽</p>
            </div>
        `;
    }
    
    openModal('order-details-modal');
}
function getOrderDishesHTML(order) {
    let html = '<div class="order-dishes-list">';
    
    const dishes = [
        { id: order.soup_id, type: 'Суп' },
        { id: order.main_course_id, type: 'Главное блюдо' },
        { id: order.salad_id, type: 'Салат' },
        { id: order.drink_id, type: 'Напиток' },
        { id: order.dessert_id, type: 'Десерт' }
    ];
    
    dishes.forEach(dishInfo => {
        if (dishInfo.id) {
            const dish = allDishes.find(d => d.id === dishInfo.id);
            if (dish) {
                html += `
                    <div class="order-dish-item">
                        <span class="dish-type">${dishInfo.type}:</span>
                        <span class="dish-name">${dish.name}</span>
                        <span class="dish-price">${dish.price} ₽</span>
                    </div>
                `;
            }
        }
    });
    
    html += '</div>';
    return html;
}

function editOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    document.getElementById('edit-order-id').value = order.id;
    document.getElementById('edit-full-name').value = order.full_name;
    document.getElementById('edit-email').value = order.email;
    document.getElementById('edit-phone').value = order.phone;
    document.getElementById('edit-delivery-address').value = order.delivery_address;
    document.getElementById('edit-comment').value = order.comment || '';
    const deliveryTypeRadios = document.querySelectorAll('input[name="delivery_type"]');
    deliveryTypeRadios.forEach(radio => {
        radio.checked = radio.value === order.delivery_type;
    });
    const timeGroup = document.getElementById('edit-delivery-time-group');
    const timeInput = document.getElementById('edit-delivery-time');
    
    if (order.delivery_type === 'by_time' && order.delivery_time) {
        timeGroup.style.display = 'block';
        timeInput.value = order.delivery_time;
    } else {
        timeGroup.style.display = 'none';
        timeInput.value = '';
    }
    
    openModal('edit-order-modal');
}
async function saveOrderChanges() {
    const orderId = document.getElementById('edit-order-id').value;
    const formData = new FormData(document.getElementById('edit-order-form'));
    
    const orderData = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        delivery_address: formData.get('delivery_address'),
        delivery_type: formData.get('delivery_type'),
        comment: formData.get('comment')
    };
    if (orderData.delivery_type === 'by_time') {
        orderData.delivery_time = formData.get('delivery_time');
    }
    
    try {
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка сохранения заказа');
        }
        
        const updatedOrder = await response.json();
        const orderIndex = allOrders.findIndex(o => o.id === parseInt(orderId));
        if (orderIndex !== -1) {
            allOrders[orderIndex] = { ...allOrders[orderIndex], ...updatedOrder };
        }
        
        showNotification('Заказ успешно изменён');
        closeModal('edit-order-modal');
        displayOrders();
        
    } catch (error) {
        console.error('Ошибка сохранения заказа:', error);
        showNotification('Ошибка сохранения заказа: ' + error.message, 'error');
    }
}
function confirmDeleteOrder(orderId) {
    currentOrderToDelete = orderId;
    openModal('delete-order-modal');
}

async function deleteOrder() {
    if (!currentOrderToDelete) return;
    
    try {
        const response = await fetch(`${API_URL}/labs/api/orders/${currentOrderToDelete}?api_key=${API_KEY}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка удаления заказа');
        }
    
        allOrders = allOrders.filter(o => o.id !== currentOrderToDelete);
        
        showNotification('Заказ успешно удалён');
        closeModal('delete-order-modal');
        displayOrders();
        
    } catch (error) {
        console.error('Ошибка удаления заказа:', error);
        showNotification('Ошибка удаления заказа: ' + error.message, 'error');
    } finally {
        currentOrderToDelete = null;
    }
}
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeAllModals);
    });
    
    document.querySelectorAll('.close-modal-btn, .cancel-edit-btn, .cancel-delete-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-order-btn')) {
            const orderId = parseInt(e.target.closest('.view-order-btn').getAttribute('data-order-id'));
            viewOrderDetails(orderId);
        }
        
        if (e.target.closest('.edit-order-btn')) {
            const orderId = parseInt(e.target.closest('.edit-order-btn').getAttribute('data-order-id'));
            editOrder(orderId);
        }
        
        if (e.target.closest('.delete-order-btn')) {
            const orderId = parseInt(e.target.closest('.delete-order-btn').getAttribute('data-order-id'));
            confirmDeleteOrder(orderId);
        }
    });
    document.querySelectorAll('input[name="delivery_type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const timeGroup = document.getElementById('edit-delivery-time-group');
            timeGroup.style.display = this.value === 'by_time' ? 'block' : 'none';
        });
    });
    document.getElementById('save-order-btn').addEventListener('click', saveOrderChanges);
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteOrder);
    const notification = document.getElementById('notification');
    if (notification) {
        notification.addEventListener('click', function() {
            this.style.display = 'none';
        });
    }
});
<template>
  <div class="container">
    <div class="card">
      <h2>เลือกสินค้า</h2>
      <div class="product-selection">
        <select v-model="selectedProductId">
          <option value="" disabled>เลือกสินค้า</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }} - {{ formatPrice(product.price) }} บาท
          </option>
        </select>
        <button @click="addProductToTable">เพิ่ม</button>
      </div>
    </div>

    <div class="card">
      <h2>ตารางสินค้า</h2>
      <table>
        <thead>
          <tr>
            <th>ชื่อสินค้า</th>
            <th>ราคา</th>
            <th>จำนวน</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedProducts" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ formatPrice(item.price * item.quantity) }} บาท</td>
            <td>
              <button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
              <span style="margin: 0 10px;">{{ item.quantity }}</span>
              <button class="quantity-btn" @click="increaseQuantity(item)">+</button>
            </td>
            <td>
              <button class="remove" @click="removeProduct(item)">ลบ</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;">รวมราคาสินค้า:</td>
            <td>{{ formatPrice(totalPrice) }} บาท</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="card">
      <h2>เลือกส่วนลด</h2>
      <div class="discount-selection">
        <select v-model="selectedDiscountCampaignId">
          <option value="" disabled>เลือกส่วนลด</option>
          <option v-for="discountCampaign in discountCampaigns" :key="discountCampaign.id" :value="discountCampaign.id">
            {{ discountCampaign.name }} ({{ discountCampaign.category }})
          </option>
        </select>
        <button @click="addDiscountCampaignToTable">เพิ่ม</button>
      </div>
    </div>

    <div class="card">
      <h2>ตารางส่วนลด</h2>
      <table>
        <thead>
          <tr>
            <th>ชื่อส่วนลด</th>
            <th>หมวดหมู่ส่วนลด</th>
            <th>ตั้งค่า</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedDiscountCampaigns" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>
              <div class="discount-input-container">
                <template v-if="item.id === 1">
                  <p>ลดเป็นจำนวนเงิน</p>
                  <input type="number" v-model="item.amount" placeholder="จำนวนเงิน" min="0" max="10000" /> บาท
                </template>
                <template v-else-if="item.id === 2">
                  <p>ลดเป็นเปอร์เซ็นต์</p>
                  <input type="number" v-model="item.amount" placeholder="เปอร์เซ็นต์" min="0" max="100" /> %
                </template>
                <template v-else-if="item.id === 3">
                  <p>ลดเป็นเปอร์เซ็นต์</p>
                  <input type="number" v-model="item.amount" placeholder="เปอร์เซ็นต์" min="0" max="100" /> %
                  <p>หมวดหมู่สินค้า</p>
                  <select v-model="item.category_id">
                    <option value="" disabled>เลือกสินค้า</option>
                    <option v-for="category in categoryProductsTypeDDL" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </template>
                <template v-else-if="item.id === 4">
                  <p>ใช้แต้ม</p>
                  <input type="number" v-model="item.amount" placeholder="แต้ม" min="0" max="10000" /> แต้ม
                </template>
                <template v-else-if="item.id === 5">
                  <p>เมื่อยอดถึง</p>
                  <input type="number" v-model="item.threshold" placeholder="ถึงกี่บาท" min="0" max="10000" /> บาท
                  <p>ลดกี่บาท</p>
                  <input type="number" v-model="item.amount" placeholder="ลดกี่บาท" min="0" max="10000" /> บาท
                </template>
              </div>
            </td>
            <td>
              <button class="remove" @click="removeDiscountCampaign(item)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="total-price" >
        ราคาสุทธิหลังหักส่วนลด: {{ formatPrice(totalPriceAfterDiscount) }} บาท
      </div>
      
      <button class="calculate" @click="calculateDiscount">คำนวณส่วนลด</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const selectedProductId = ref(null)
const selectedDiscountCampaignId = ref(null)
const totalPriceAfterDiscount = ref(0)
const products = ref([])
const discountCampaigns = ref([])
const discountCampaignsDDL = ref([])
const categoryProductsTypeDDL = ref([])
const selectedProducts = ref([])
const selectedDiscountCampaigns = ref([])

onMounted(async () => {
  const productsApi = await fetch('http://localhost:3000/api/products')
  const dataProducts = await productsApi.json()
  products.value = dataProducts.products

  const discountCampaignsApi = await fetch('http://localhost:3000/api/discountCampaigns')
  const dataDiscountCampaigns = await discountCampaignsApi.json()
  discountCampaigns.value = dataDiscountCampaigns.discountCampaigns

  const discountCategotyDDLApi = await fetch('http://localhost:3000/api/discountCategotyDDL')
  const dataDiscountCategotyDDL = await discountCategotyDDLApi.json()
  discountCampaignsDDL.value = dataDiscountCategotyDDL.discountCategoty

  const categoryProductsTypeDDLApi = await fetch('http://localhost:3000/api/categoryProductsTypeDDL')
  const dataCategoryProductsTypeDDL = await categoryProductsTypeDDLApi.json()
  categoryProductsTypeDDL.value = dataCategoryProductsTypeDDL.categoryProductsType
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('th-TH').format(price)
}

const addProductToTable = () => {
  const selectedProduct = products.value.find(product => product.id === selectedProductId.value)
  if (selectedProduct && !selectedProducts.value.some(item => item.id === selectedProduct.id)) {
    selectedProduct.quantity = 1
    selectedProducts.value.push(selectedProduct)
    selectedProductId.value = null
  }
}

const addDiscountCampaignToTable = () => {
  const selectedDiscountCampaign = discountCampaigns.value.find(x => x.id === selectedDiscountCampaignId.value)

  if (!selectedDiscountCampaign) return

  const isDuplicateCategory = selectedDiscountCampaigns.value.some(
    item => item.category === selectedDiscountCampaign.category
  )

  if (!isDuplicateCategory) {
    selectedDiscountCampaign.quantity = 1
    selectedDiscountCampaigns.value.push(selectedDiscountCampaign)
    selectedDiscountCampaignId.value = null
  } else {
    alert("ไม่สามารถเลือกส่วนลดที่มีหมวดหมู่เดียวกันได้!")
  }
}


const increaseQuantity = (item) => {
  item.quantity++
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
  } else if (item.quantity === 1) {
    removeProduct(item)
  }
}

const removeProduct = (item) => {
  selectedProducts.value = selectedProducts.value.filter(product => product.id !== item.id)
}

const removeDiscountCampaign = (item) => {
  selectedDiscountCampaigns.value = selectedDiscountCampaigns.value.filter(product => product.id !== item.id)
}

const totalPrice = computed(() => {
  return selectedProducts.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

const calculateDiscount = async () => {
  const payload = {
    items: selectedProducts.value.map(item => ({
        id: item.id,
        quantity: item.quantity
    })),
    discountList: selectedDiscountCampaigns.value.map(discount => ({
        id: discount.id,
        amount: discount.amount || 0,
        category: discount.category_id || 0, 
        threshold: discount.threshold || 0
    }))
  };

  try {
    const response = await fetch('http://localhost:3000/api/calculateTotal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    totalPriceAfterDiscount.value = result.finalTotal;
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap');

:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --success-color: #4caf50;
  --danger-color: #f44336;
  --warning-color: #ff9800;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

body {
  font-family: 'Prompt', 'Kanit', sans-serif;
  background-color: #f5f7fa;
  color: var(--dark-color);
  line-height: 1.6;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
  margin-bottom: 20px;
}

h2 {
  color: var(--primary-color);
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-weight: 600;
}

select, input, button {
  padding: 10px 15px;
  border-radius: var(--border-radius);
  border: 1px solid #ddd;
  font-family: inherit;
  font-size: 1rem;
  transition: var(--transition);
}

select {
  min-width: 250px;
  background-color: white;
  cursor: pointer;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin-left: 10px;
}

button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

button.remove {
  background-color: var(--danger-color);
}

button.quantity-btn {
  background-color: var(--accent-color);
  width: 35px;
  height: 35px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

button.calculate {
  background-color: var(--success-color);
  padding: 12px 25px;
  font-size: 1.1rem;
  margin-top: 20px;
}

.product-selection, .discount-selection {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  overflow: hidden;
}

table th, table td {
  padding: 12px 15px;
  text-align: left;
}

table th {
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
}

table tr:nth-child(even) {
  background-color: rgba(67, 97, 238, 0.05);
}

table tfoot {
  font-weight: bold;
  background-color: var(--light-color);
}

table tfoot td {
  border-top: 2px solid #ddd;
}

.discount-input-container {
  margin: 10px 0;
}

.discount-input-container p {
  margin: 5px 0;
  font-weight: 500;
  color: var(--dark-color);
}

.total-price {
  font-size: 1.5rem;
  text-align: right;
  margin: 20px 0;
  color: var(--primary-color);
  font-weight: bold;
}

@media (max-width: 768px) {
  .product-selection, .discount-selection {
    flex-direction: column;
    align-items: flex-start;
  }
  
  select, button {
    width: 100%;
    margin: 5px 0;
  }
  
  table {
    font-size: 0.9rem;
  }
  
  table th, table td {
    padding: 8px 10px;
  }
}
</style>
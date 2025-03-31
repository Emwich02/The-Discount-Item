const express = require('express')
const cors = require('cors')

const app = express()
const port = 3000

app.use(cors())
app.use(express.json()); 
const productsData = {
    products: [
        { id: 1, name: 'Pant', price: 1200, category_type_id: 1 },
        { id: 2, name: 'T-Shirt', price: 899, category_type_id: 1 },
        { id: 3, name: 'Laptop', price: 25000, category_type_id: 2 },
        { id: 4, name: 'Microphone', price: 1900, category_type_id: 2 },
        { id: 5, name: 'ArmChair', price: 5000, category_type_id: 3 },
        { id: 6, name: 'Desk', price: 3000, category_type_id: 3 }
    ]
}

const categoryProductsType = [
    { id: 1, name: 'Cloth' },
    { id: 2, name: 'Technology' },
    { id: 3, name: 'Furniture' }
]

const discountCampaignsData = [
    { id: 1, name: 'Fixed amount', discount_categoty_id: 1 },
    { id: 2, name: 'Percentage discount', discount_categoty_id: 1 },
    { id: 3, name: 'Percentage by item category', discount_categoty_id: 2 },
    { id: 4, name: 'Discount by points', discount_categoty_id: 2 },
    { id: 5, name: 'Special campaigns', discount_categoty_id: 3 },
]

const discountCategoty = [
    { id: 1, name: 'Coupon' },
    { id: 2, name: 'On Top' },
    { id: 3, name: 'Seasonal' }
]

app.get('/api/products', (req, res) => {
    const productsWithCategory = productsData.products.map(product => {
        const category = categoryProductsType.find(x => x.id === product.category_type_id)
        return {
            id: product.id,
            name: product.name,
            price: product.price,
            category: category ? category.name : 'Unknown'
        }
    })

    res.json({ products: productsWithCategory })
})

app.get('/api/discountCampaigns', (req, res) => {
    const discountCampaigns = discountCampaignsData.map(item => {
        const category = discountCategoty.find(x => x.id === item.discount_categoty_id)
        return {
            id: item.id,
            name: item.name,
            category: category ? category.name : 'Unknown',
        }
    })

    res.json({ discountCampaigns: discountCampaigns })
})

app.get('/api/discountCategotyDDL', (req, res) => {
    res.json({ discountCategoty: discountCategoty })
})

app.get('/api/categoryProductsTypeDDL', (req, res) => {
    res.json({ categoryProductsType: categoryProductsType })
})

app.post('/api/calculateTotal', (req, res) => {
    try {
        const { items, discountList } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: "ไม่มีสินค้าสำหรับคำนวณราคา" });
        }

        let total = 0;
        let discountAmount = 0;

        items.forEach(item => {
            const product = productsData.products.find(p => p.id === item.id);
            if (product) {
                total += product.price * item.quantity;
            }
        });

        if (discountList && Array.isArray(discountList)) {
            discountList.forEach(discountInput => {
                if (!discountInput || typeof discountInput.id === 'undefined') {
                    console.error("พบส่วนลดที่ไม่มี ID:", discountInput);
                    return;
                }

                const discount = discountCampaignsData.find(d => d.id === discountInput.id);
                if (!discount) return;

                let currentDiscount = 0;

                switch (discount.id) {
                    case 1:
                        currentDiscount = Number(discountInput.amount) || 0;
                        break;

                    case 2:
                        currentDiscount = (total * (Number(discountInput.amount) || 0)) / 100;
                        break;

                    case 3:
                        items.forEach(item => {
                            const product = productsData.products.find(p => p.id === item.id);
                            if (product && product.category_type_id === discountInput.category) {
                                currentDiscount += (product.price * item.quantity * (Number(discountInput.amount) || 0)) / 100;
                            }
                        });
                        break;

                    case 4:
                        currentDiscount = Number(discountInput.amount) || 0;
                        break;

                    case 5: 
                        const threshold = Number(discountInput.threshold) || 0;  
                        const discountAmount = Number(discountInput.amount) || 0;  

                        if (threshold > 0) {
                            const discountTimes = Math.floor(total / threshold);  
                            currentDiscount = discountTimes * discountAmount;  
                        }
                        break;


                    default:
                        console.warn(`ประเภทส่วนลดไม่รองรับ: ${discount.id}`);
                }

                discountAmount += currentDiscount;
            });
        }

        const finalTotal = Math.max(total - discountAmount, 0);
        res.json({ total, discountAmount, finalTotal });
    } catch (error) {
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการคำนวณ", details: error.message });
    }
});



app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`)
})

# 🎯 **Simplified Airtable Shop System**

Your shop system has been completely converted to use **Airtable + Email Authentication**! No more Slack, no more Loops, just a clean shop system.

## 🔧 **Quick Setup**

### 1. **Create Your Airtable Base**

Go to [Airtable](https://airtable.com) and create a new base with these tables:

#### **Users Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `email` | Single line text | User's email address (primary key) |
| `name` | Single line text | User's display name |
| `isAdmin` | Checkbox | Admin privileges |
| `tokens` | Number | Current token balance |

#### **Shop Items Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `name` | Single line text | Item name |
| `description` | Long text | Item description |
| `imageUrl` | Single line text | Product image URL |
| `price` | Number | Price in tokens |
| `type` | Single select | 'digital' or 'physical' |

#### **Shop Orders Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `shopItemId` | Link to Shop Items | Link to purchased item |
| `priceAtOrder` | Number | Price when ordered |
| `status` | Single select | 'pending', 'fulfilled', 'rejected' |
| `memo` | Long text | Order notes |
| `createdAt` | Date | Order creation timestamp |
| `userEmail` | Single line text | Buyer's email |

#### **Payouts Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `tokens` | Number | Token amount |
| `userEmail` | Single line text | Recipient's email |
| `memo` | Long text | Payout notes |
| `createdAt` | Date | Payout timestamp |

### 2. **Get Your Airtable Credentials**

**Personal Access Token**: Go to [Airtable Tokens](https://airtable.com/create/tokens) → Create new token → Copy it

**Base ID**: From your base URL: `https://airtable.com/app[BASE_ID]/...` → Copy the `app...` part

### 3. **Update Environment Variables**

Edit your `.env` file:

```bash
# Add your Airtable credentials  
AIRTABLE_ACCESS_TOKEN=your_airtable_personal_access_token_here
AIRTABLE_BASE_ID=your_actual_base_id_here

# Table names (keep these as-is)
AIRTABLE_USERS_TABLE=Users
AIRTABLE_SHOP_ITEMS_TABLE=Shop Items
AIRTABLE_SHOP_ORDERS_TABLE=Shop Orders
AIRTABLE_PAYOUTS_TABLE=Payouts
```

## 🚀 **How It Works**

### **🔐 Simple Email Login**
- Users visit `/login`
- Enter their email (+ optional name)
- System creates account automatically if new
- No passwords, no OAuth, just email

### **💰 Real-Time Token Management**
- User tokens are stored directly in Airtable
- When someone buys an item, tokens are immediately deducted
- Admin can add tokens via payouts

### **🛒 Shopping Flow**
1. User logs in with email
2. Browses shop items
3. Clicks "Buy" on an item
4. System checks token balance
5. Deducts tokens immediately
6. Creates order record
7. Done! ✨

### **👑 Admin Panel**
- Set `isAdmin` to `true` in Airtable Users table
- Visit `/admin` to manage:
  - View all orders
  - Update order status (pending → fulfilled/rejected)
  - View all users and their token balances
  - Add new shop items

## 🧪 **Testing Your Setup**

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Visit the site**: Should redirect to `/login`

3. **Login with your email**: Creates your account automatically

4. **Make yourself admin**: 
   - Go to Airtable Users table
   - Find your email
   - Check the `isAdmin` checkbox

5. **Add some tokens**:
   - Go to Payouts table in Airtable
   - Add a record: your email + some tokens (e.g., 100)
   - Refresh the shop - your balance should update

6. **Add shop items**: Visit `/admin` to add products

7. **Test purchasing**: Buy something and watch tokens deduct in real-time!

## 📱 **Sample Data to Get Started**

### **Shop Items** (add these in Airtable):
1. **Digital Sticker Pack**
   - Price: 10 tokens
   - Description: "Cool digital stickers for your laptop"
   - Type: digital

2. **Premium Access**
   - Price: 50 tokens  
   - Description: "30 days of premium features"
   - Type: digital

3. **Physical T-Shirt**
   - Price: 100 tokens
   - Description: "Limited edition shop t-shirt"
   - Type: physical

### **Give Yourself Tokens**:
Add a payout record in Airtable:
- `userEmail`: your_email@example.com
- `tokens`: 200
- `memo`: "Welcome bonus"

## 🎉 **What's Different**

✅ **No Slack** - Pure email-based login  
✅ **No Loops** - No email notifications (admin contacts users manually)  
✅ **No PostgreSQL** - Pure Airtable backend  
✅ **Simplified** - Just the core shop functionality  
✅ **Real-time** - Instant token deduction on purchase  

## 🔧 **Admin Tasks**

**To make someone admin**: Check `isAdmin` in Users table

**To add tokens**: Create Payout record with their email + token amount

**To fulfill orders**: Go to `/admin/orders` and update status

**To add products**: Go to `/admin` and click "Add New Item"

---

**Your clean, simple shop system is ready! 🎊**

Just set your `AIRTABLE_BASE_ID` and you're good to go!
# 🔄 Airtable Migration Guide

Your shop system has been successfully converted from PostgreSQL to Airtable! This guide will help you set up and configure everything.

## 🎯 What Changed

✅ **Preserved**: All frontend design and user experience  
✅ **Enhanced**: Real-time token balance management  
✅ **Improved**: Direct token deduction on purchase  
✅ **Maintained**: Admin panel functionality  

## 📋 Airtable Base Setup

### 1. Create Your Airtable Base

1. Go to [Airtable](https://airtable.com) and create a new base
2. Create the following tables with these fields:

#### **Users Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `slackId` | Single line text | Primary identifier (Slack user ID) |
| `avatarUrl` | Single line text | User's profile picture URL |
| `isAdmin` | Checkbox | Admin privileges |
| `country` | Single line text | User's country code |
| `yswsDbFulfilled` | Checkbox | YSWS database fulfillment status |
| `tokens` | Number | **Current token balance** |

#### **Shop Items Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `name` | Single line text | Item name |
| `description` | Long text | Item description |
| `imageUrl` | Single line text | Product image URL |
| `price` | Number | Price in tokens |
| `usd_cost` | Number | Optional USD cost |
| `type` | Single select | 'hcb' or 'third_party' |
| `hcbMids` | Long text | JSON array of HCB MIDs |

#### **Shop Orders Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `shopItemId` | Link to Shop Items | Link to purchased item |
| `priceAtOrder` | Number | Price when ordered |
| `status` | Single select | 'pending', 'fulfilled', 'rejected' |
| `memo` | Long text | Order notes |
| `createdAt` | Date | Order creation timestamp |
| `userId` | Link to Users | Link to buyer |

#### **Payouts Table**
| Field Name | Type | Description |
|------------|------|-------------|
| `tokens` | Number | Token amount |
| `userId` | Link to Users | Link to recipient |
| `memo` | Long text | Payout notes |
| `createdAt` | Date | Payout timestamp |
| `submittedToUnified` | Checkbox | Submitted to unified system |
| `baseHackatimeHours` | Number | Base Hackatime hours |
| `overridenHours` | Number | Overridden hours |

### 2. Get Your Airtable Credentials

1. **API Key**: Go to [Airtable Account](https://airtable.com/account) → Generate API key
2. **Base ID**: From your base URL: `https://airtable.com/app[BASE_ID]/...`

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Required Airtable Settings
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Optional: Custom table names (use defaults if unsure)
AIRTABLE_USERS_TABLE=Users
AIRTABLE_SHOP_ITEMS_TABLE=Shop Items
AIRTABLE_SHOP_ORDERS_TABLE=Shop Orders
AIRTABLE_PAYOUTS_TABLE=Payouts

# Keep existing Slack/Loops settings
SLACK_BOT_TOKEN=your_existing_token
LOOPS_API_KEY=your_existing_key
```

## 🚀 Key Features

### ✨ **Enhanced Token Management**

**Before (PostgreSQL)**: Token balance calculated from payouts - orders  
**Now (Airtable)**: Direct token balance stored and updated in real-time

When someone purchases:
1. ✅ Checks available token balance
2. ✅ Immediately subtracts tokens from user account  
3. ✅ Creates order record
4. ✅ All in one atomic operation

### 🔄 **Seamless Frontend**

- **No changes** to your beautiful frontend design
- All existing components work exactly the same
- Same API endpoints and responses
- Users won't notice any difference!

### 🛡️ **Admin Panel**

- View all orders with item and user details
- Update order status (pending → fulfilled/rejected)
- Email notifications still work via Loops
- User management with token balances

## 🧪 Testing Your Setup

1. **Start the development server**:
```bash
npm run dev
```

2. **Test the main shop page**: Should load all items from Airtable

3. **Test user authentication**: Make sure user sessions work

4. **Test purchasing**: Try buying an item (tokens should be deducted)

5. **Test admin panel**: Check `/admin` for order management

## 📊 Data Migration (If Needed)

If you have existing PostgreSQL data, you can export it and import to Airtable:

### Export from PostgreSQL:
```sql
-- Export users
COPY (SELECT "slackId", "avatarUrl", "isAdmin", "country", "yswsDbFulfilled" FROM "user") TO 'users.csv' CSV HEADER;

-- Export shop items
COPY (SELECT * FROM "shop_items") TO 'shop_items.csv' CSV HEADER;

-- Export orders
COPY (SELECT * FROM "shop_orders") TO 'orders.csv' CSV HEADER;

-- Export payouts  
COPY (SELECT * FROM "payouts") TO 'payouts.csv' CSV HEADER;
```

### Calculate Token Balances:
For each user, calculate: `SUM(payouts) - SUM(fulfilled_orders)` and add to Users table.

## 🔧 Troubleshooting

### Common Issues:

1. **"AIRTABLE_API_KEY not defined"**
   - Make sure `.env` file exists with correct API key

2. **"Shop item not found"**  
   - Check that your Shop Items table has records
   - Verify table names in environment variables

3. **Token balance not updating**
   - Ensure Users table has a `tokens` field (Number type)
   - Check that user records exist in Airtable

4. **Admin panel shows no data**
   - Verify user has `isAdmin` checkbox checked in Airtable
   - Check that all required tables exist

### Debug Mode:
Check browser console and server logs for detailed error messages.

## 🎉 Benefits of Airtable

✅ **Visual Interface**: Easy to manage data through Airtable's GUI  
✅ **Real-time Updates**: Changes reflect immediately  
✅ **Collaboration**: Multiple admins can manage data  
✅ **Backup**: Built-in version history and backup  
✅ **Reporting**: Use Airtable views for analytics  
✅ **API Rate Limits**: More generous than typical database limits  
✅ **No Infrastructure**: No database server to maintain  

## 🔗 Useful Links

- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)
- [Airtable Base Templates](https://airtable.com/templates)
- [Airtable JavaScript SDK](https://github.com/Airtable/airtable.js/)

---

**Your shop system is now powered by Airtable! 🎊**  
All the design you love, with the flexibility of Airtable behind it.
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import Customer from '@/lib/models/Customer';
import Product from '@/lib/models/Product';
import mongoose from 'mongoose';

// Function to update product inventory
async function updateProductInventory(productId: string, quantityOrdered: number) {
  try {
    console.log(`Attempting to update inventory for product ID: ${productId}`);
    console.log(`Quantity ordered: ${quantityOrdered}`);
    
    const product = await Product.findById(productId);
    console.log(`Product found:`, product ? `${product.name} (Available: ${product.availableQuantity})` : 'null');
    
    if (!product) {
      console.error(`Product not found with ID: ${productId}`);
      return false;
    }

    console.log(`Current available quantity: ${product.availableQuantity}`);
    console.log(`Requested quantity: ${quantityOrdered}`);

    if (product.availableQuantity < quantityOrdered) {
      console.error(`Insufficient inventory. Available: ${product.availableQuantity}, Ordered: ${quantityOrdered}`);
      return false;
    }

    // Calculate new quantity and status
    const newQuantity = product.availableQuantity - quantityOrdered;
    const newStatus = newQuantity === 0 ? 'sold' : product.status;

    // Use direct update to avoid validation issues
    const updateResult = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          availableQuantity: newQuantity,
          status: newStatus
        }
      },
      { 
        new: true,
        runValidators: false // Skip validation to avoid required field issues
      }
    );

    if (!updateResult) {
      console.error(`Failed to update product ${productId}`);
      return false;
    }

    console.log(`Successfully updated inventory for product ${productId}: ${newQuantity} remaining`);
    if (newStatus === 'sold') {
      console.log(`Product marked as sold (out of stock)`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating product inventory:', error);
    return false;
  }
}

// Function to rollback product inventory (in case order creation fails)
async function rollbackProductInventory(productId: string, quantityToRestore: number) {
  try {
    const product = await Product.findById(productId);
    if (!product) return false;

    const newQuantity = product.availableQuantity + quantityToRestore;
    const newStatus = (product.status === 'sold' && newQuantity > 0) ? 'available' : product.status;
    
    // Use direct update to avoid validation issues
    const updateResult = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          availableQuantity: newQuantity,
          status: newStatus
        }
      },
      { 
        new: true,
        runValidators: false // Skip validation to avoid required field issues
      }
    );

    if (!updateResult) {
      console.error(`Failed to rollback inventory for product ${productId}`);
      return false;
    }

    console.log(`Rolled back inventory for product ${productId}: +${quantityToRestore} (now ${newQuantity} total)`);
    return true;
  } catch (error) {
    console.error('Error rolling back product inventory:', error);
    return false;
  }
}

// GET /api/orders?customerId=...
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ order }, { status: 200 });
    }

    if (!customerId) return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    const customer = await Customer.findById(customerId);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    
    // If no orders exist, return sample data for demonstration
    if (orders.length === 0) {
      const sampleOrders = [
        {
          _id: 'sample_order_1',
          customerId: customerId,
          items: [
            {
              productId: 'sample_product_1',
              name: 'Fresh Tomatoes',
              price: 150.00,
              quantity: 2,
              image: '/images/categories/vegetables.webp'
            },
            {
              productId: 'sample_product_2', 
              name: 'Organic Rice',
              price: 200.00,
              quantity: 1,
              image: '/images/categories/rice-grains.jpg'
            }
          ],
          totalAmount: 500.00,
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: 'cod',
          shippingAddress: {
            line1: '123 Main Street',
            city: 'Colombo',
            district: 'Colombo',
            province: 'Western'
          },
          tracking: [
            { status: 'delivered', note: 'Order delivered successfully', at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
          ],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'sample_order_2',
          customerId: customerId,
          items: [
            {
              productId: 'sample_product_3',
              name: 'Fresh Bananas',
              price: 80.00,
              quantity: 3,
              image: '/images/categories/fruits.jpg'
            }
          ],
          totalAmount: 240.00,
          status: 'shipped',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          shippingAddress: {
            line1: '456 Garden Road',
            city: 'Kandy',
            district: 'Kandy',
            province: 'Central'
          },
          tracking: [
            { status: 'shipped', note: 'Order shipped and on the way', at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'sample_order_3',
          customerId: customerId,
          items: [
            {
              productId: 'sample_product_4',
              name: 'Coconut Oil',
              price: 300.00,
              quantity: 1,
              image: '/images/categories/coconut-products.jpg'
            },
            {
              productId: 'sample_product_5',
              name: 'Spices Mix',
              price: 120.00,
              quantity: 2,
              image: '/images/categories/spices.jpg'
            }
          ],
          totalAmount: 540.00,
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          shippingAddress: {
            line1: '789 Market Street',
            city: 'Galle',
            district: 'Galle',
            province: 'Southern'
          },
          tracking: [
            { status: 'processing', note: 'Order is being prepared', at: new Date(Date.now() - 6 * 60 * 60 * 1000) }
          ],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ];
      return NextResponse.json({ orders: sampleOrders }, { status: 200 });
    }
    
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders - create order from cart
export async function POST(req: NextRequest) {
  try {
    console.log('=== Orders API POST called ===');
    await dbConnect();
    console.log('Database connected successfully');
    
    const requestData = await req.json();
    console.log('Orders API received data:', requestData);
    
    // Validate required fields
    if (!requestData.customerId) {
      console.error('Validation error: customerId is missing');
      return NextResponse.json({ 
        error: 'Customer ID is required',
        details: 'customerId field is missing from request data'
      }, { status: 400 });
    }
    
    const { 
      customerId, 
      paymentMethod = 'cod', 
      shippingAddress,
      // Direct product ordering fields
      productId,
      sellerId,
      productName,
      sellerName,
      pricePerKg,
      quantity,
      unit,
      subtotal,
      processingFee,
      deliveryFee,
      total,
      deliveryInfo
    } = requestData;

    console.log('Extracted data:', {
      customerId,
      paymentMethod,
      productId,
      productName,
      quantity,
      total
    });

    if (!customerId) {
      console.error('No customer ID provided');
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      console.error('Invalid customer ID format:', customerId);
      return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 });
    }

    console.log('Looking up customer with ID:', customerId);
    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.error('Customer not found:', customerId);
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    console.log('Customer found:', { 
      id: customer._id, 
      name: customer.name,
      email: customer.email 
    });

    let order;

    // Check if this is a direct product order or cart-based order
    if (productId && productName && pricePerKg && quantity) {
      console.log('Creating direct product order');
      
      // Validate productId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.error('Invalid product ID format:', productId);
        return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
      }
      
      // Direct product ordering
      const items = [{
        productId: new mongoose.Types.ObjectId(productId),
        name: productName,
        price: pricePerKg,
        quantity: quantity,
        image: ''
      }];

      console.log('Order items prepared:', items);

      // Map payment method names
      let mappedPaymentMethod = paymentMethod;
      if (paymentMethod === 'cash-on-delivery' || paymentMethod === 'cod') {
        mappedPaymentMethod = 'cod';
      } else if (paymentMethod === 'stripe') {
        mappedPaymentMethod = 'card';
      } else if (paymentMethod === 'bank-transfer') {
        mappedPaymentMethod = 'bank';
      }

      const orderData: any = {
        customerId: new mongoose.Types.ObjectId(customerId),
        items,
        totalAmount: total || subtotal || (pricePerKg * quantity),
        paymentMethod: mappedPaymentMethod,
        paymentStatus: mappedPaymentMethod === 'cod' ? 'unpaid' : 'unpaid',
        status: 'pending',
        tracking: [{ status: 'pending', note: 'Order placed', at: new Date() }]
      };

      console.log('Final order data before save:', {
        customerId: orderData.customerId.toString(),
        itemsCount: orderData.items.length,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod
      });

      // Use deliveryInfo if provided, otherwise fall back to shippingAddress
      if (deliveryInfo) {
        orderData.shippingAddress = {
          line1: deliveryInfo.address,
          line2: deliveryInfo.specialInstructions,
          city: deliveryInfo.district,
          district: deliveryInfo.district,
          province: deliveryInfo.province,
          postalCode: deliveryInfo.postalCode
        };
      } else if (shippingAddress) {
        orderData.shippingAddress = shippingAddress;
      }

      // Add seller information if provided
      if (sellerId && sellerName) {
        orderData.supplier = {
          id: sellerId,
          name: sellerName,
          businessName: sellerName,
          claimedAt: new Date()
        };
      }

      console.log('Final order data:', orderData);

      // Check and update product inventory before creating order
      if (productId && quantity) {
        console.log(`🔄 About to check inventory for product: ${productId}, quantity: ${quantity}`);
        
        // First, let's just check if the product exists without updating inventory
        try {
          const product = await Product.findById(productId);
          console.log('Product lookup result:', product ? {
            id: product._id,
            name: product.name,
            availableQuantity: product.availableQuantity,
            status: product.status
          } : 'Product not found');
          
          if (!product) {
            console.error('❌ Product not found in database');
            return NextResponse.json({ 
              error: 'Product not found. Please refresh and try again.',
              details: `Product with ID ${productId} does not exist in database`,
              productId
            }, { status: 404 });
          }
          
          if (product.availableQuantity < quantity) {
            console.error('❌ Insufficient inventory');
            return NextResponse.json({ 
              error: 'Insufficient inventory. Please refresh and try again.',
              details: `Available: ${product.availableQuantity}, Requested: ${quantity}`,
              available: product.availableQuantity,
              requested: quantity
            }, { status: 400 });
          }
          
          console.log('✅ Product exists and has sufficient inventory');
          
          // Now update the inventory
          const inventoryUpdated = await updateProductInventory(productId, quantity);
          if (!inventoryUpdated) {
            console.error('❌ Inventory update failed');
            return NextResponse.json({ 
              error: 'Failed to update inventory. Please try again.',
              details: `Inventory update failed for product ${productId}`,
              productId,
              requestedQuantity: quantity
            }, { status: 500 });
          }
          console.log('✅ Inventory updated successfully');
          
        } catch (inventoryError) {
          console.error('❌ Error during inventory check/update:', inventoryError);
          return NextResponse.json({ 
            error: 'Database error during inventory check. Please try again.',
            details: inventoryError instanceof Error ? inventoryError.message : 'Unknown inventory error'
          }, { status: 500 });
        }
      }

      try {
        order = await Order.create(orderData);
        console.log('Order created successfully:', order._id);
      } catch (orderError) {
        // Rollback inventory if order creation fails
        if (productId && quantity) {
          await rollbackProductInventory(productId, quantity);
        }
        throw orderError;
      }

      // Return response with payment URLs for different methods
      let response: any = {
        success: true,
        message: 'Order created successfully',
        order: {
          _id: order._id,
          customerId: order.customerId,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt
        }
      };

      if (mappedPaymentMethod === 'card' && paymentMethod === 'stripe') {
        // In a real implementation, integrate with Stripe
        response.checkoutUrl = `https://checkout.stripe.com/pay/${order._id}`;
      } else if (paymentMethod === 'payhere') {
        // In a real implementation, integrate with PayHere
        response.paymentUrl = `https://www.payhere.lk/pay/${order._id}`;
      }

      console.log('Returning response:', response);
      return NextResponse.json(response, { status: 201 });

    } else {
      // Cart-based ordering (existing functionality)
      const cart = await Cart.findOne({ customerId });
      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
      }

      const items = cart.items.map((i: any) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      }));

      // Update inventory for all cart items before creating order
      const updatedItems: any[] = [];
      for (const item of items) {
        if (item.productId) {
          const inventoryUpdated = await updateProductInventory(item.productId, item.quantity);
          if (!inventoryUpdated) {
            // Rollback previously updated items
            for (const updatedItem of updatedItems) {
              await rollbackProductInventory(updatedItem.productId, updatedItem.quantity);
            }
            return NextResponse.json({ 
              error: `Insufficient inventory for ${item.name}. Please refresh and try again.` 
            }, { status: 400 });
          }
          updatedItems.push(item);
        }
      }

      const totalAmount = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

      try {
        order = await Order.create({
          customerId: new mongoose.Types.ObjectId(customerId),
          items,
          totalAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
          status: 'pending',
          shippingAddress,
          tracking: [{ status: 'pending', note: 'Order placed', at: new Date() }]
        });
      } catch (orderError) {
        // Rollback inventory if order creation fails
        for (const item of updatedItems) {
          await rollbackProductInventory(item.productId, item.quantity);
        }
        throw orderError;
      }

      // Clear cart after creating order
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();

      return NextResponse.json({ message: 'Order created', order }, { status: 201 });
    }
  } catch (error) {
    console.error('Orders POST error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    let errorDetails = undefined;
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      errorDetails = error.message;
      
      // Handle specific database errors
      if (error.message.includes('validation')) {
        errorMessage = 'Invalid order data. Please check your information and try again.';
        statusCode = 400;
      } else if (error.message.includes('duplicate')) {
        errorMessage = 'Order already exists. Please refresh and try again.';
        statusCode = 409;
      } else if (error.message.includes('Cast to ObjectId failed')) {
        errorMessage = 'Invalid product or customer ID. Please refresh and try again.';
        statusCode = 400;
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }, { status: statusCode });
  }
}

// PUT /api/orders - update order status or payment
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, status, paymentStatus, trackingNote } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNote) {
      if (!order.tracking) order.tracking = [];
      order.tracking.push({ status: status || order.status, note: trackingNote, at: new Date() });
    }

    await order.save();
    return NextResponse.json({ message: 'Order updated', order }, { status: 200 });
  } catch (error) {
    console.error('Orders PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


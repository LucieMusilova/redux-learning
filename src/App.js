
import { useSelector } from 'react-redux';
import { useEffect, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from './store/ui-slice';
import { cartActions } from './store/cart-slice';

import Cart from './components/Cart/Cart';
import Layout from './components/Layout/Layout';
import Products from './components/Shop/Products';
import Notification from './components/UI/Notification';

let isInitial = true;

function App() {
  const showCart = useSelector((state) => state.ui.cartIsVisible);
  const cart = useSelector((state) => state.cart);
  const notification = useSelector((state) => state.ui.notification);
  const dispatch = useDispatch();

  const fetchCartData = () => {
    return async (dispatch) => {
      const fetchData = async () => {
        const response = await fetch('https://redux-learning-f46a6-default-rtdb.europe-west1.firebasedatabase.app/cart.json');

        if(!response.ok) {
          throw new Error('Could not fetch data!')
        }

        const data = await response.json(); 
        return data; 
      }

      try {
        const cartData = await fetchData();
        dispatch(cartActions.replaceCart({
          items: cartData.items || [],
          totalQuantity: cartData.totalQuantity,
        }));
      } catch (error) {
        dispatch(
          uiActions.showNotification({
            status:'error',
            title:'Error...',
            message:'Sending cart data failed.',
          })
         )
      }
    }
  }

  useEffect(()=> {
    dispatch(fetchCartData())
  }, [dispatch]);

  useEffect(()=> {
    const sendCartData = async() => {
     dispatch(
      uiActions.showNotification({
        status:'pending',
        title:'Sending...',
        message:'Sending cart data!',
      })
     )
     const response = await fetch('https://redux-learning-f46a6-default-rtdb.europe-west1.firebasedatabase.app/cart.json', {
        method: 'PUT', 
        body: JSON.stringify(cart),
      });

      if(!response.ok) {
        throw new Error('Sending cart data failed.')
      }

      dispatch(
        uiActions.showNotification({
          status:'success',
          title:'Success...',
          message:'Sending cart data successfully!',
        })
       )
    }

    if(isInitial){
      isInitial = false;
      return;
    }

    if (cart.changed) {
      const sendCartData = async() => {
        dispatch(
         uiActions.showNotification({
           status:'pending',
           title:'Sending...',
           message:'Sending cart data!',
         })
        )
        const response = await fetch('https://redux-learning-f46a6-default-rtdb.europe-west1.firebasedatabase.app/cart.json', {
           method: 'PUT', 
           body: JSON.stringify({
            items: cart.items,
            totalQuantity: cart.totalQuantity,
           }),
         });
   
         if(!response.ok) {
           throw new Error('Sending cart data failed.')
         }
   
         dispatch(
           uiActions.showNotification({
             status:'success',
             title:'Success...',
             message:'Sending cart data successfully!',
           })
          )
       }
       sendCartData().catch((error) => {
        dispatch(
          uiActions.showNotification({
            status:'error',
            title:'Error...',
            message:'Sending cart data failed.',
          })
         )
      });
    }

    
  },[cart, dispatch]);
    
  return (
    <Fragment>
      {notification && <Notification status={notification.status} title={notification.title} message={notification.message}/>}
      <Layout>
        {showCart && <Cart />}
        <Products />
      </Layout>
    </Fragment>
  );
}

export default App;
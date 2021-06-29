import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productInCart = cart.find(item => item.id === productId);

      if (productInCart) {
        const response = await api.get<Stock>(`/stock/${productId}`);
        
        if (response.data.amount > productInCart.amount) {
          // adiciona um item
          productInCart.amount += 1;

          // atualizar carrinho
          const cartList = cart.filter(item => item.id !== productId);
          cartList.push(productInCart);
          setCart(cartList);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartList));

        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }

      } else {
        const response = await api.get(`/products/${productId}`);
        setCart(oldState => ([...oldState, { ...response.data, amount: 1 }]));
        const newCart = [...cart, { ...response.data, amount: 1 }];
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }

    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const product = cart.find(item => item.id === productId);

      if (product) {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        toast.error('Erro na remoção do produto');  
      }

    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        return;
      }

      const productInCart = cart.find(item => item.id === productId);

      if (productInCart) {
        const response = await api.get<Stock>(`/stock/${productId}`);
        
        if (response.data.amount > productInCart.amount) {
          // adiciona um item
          productInCart.amount += 1;

          // atualizar carrinho
          const cartList = cart.filter(item => item.id !== productId);
          cartList.push(productInCart);
          setCart(cartList);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartList));

        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }

      } else {
        toast.error('Erro na alteração de quantidade do produto');
      }

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

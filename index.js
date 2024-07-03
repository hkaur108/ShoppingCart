
const productsCent= document.querySelector(".products-center");
const closeCartBtn= document.querySelector(".close-cart");
const cartOverlay= document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartBtn=document.querySelector(".cart-btn");
const cartItems=document.querySelector(".cart-items");
const cartTotal=document.querySelector(".cart-total");
const cartContent= document.querySelector(".cart-content");
const clearCartBtn= document.querySelector(".clear-cart");


// Empty Cart
let cartInfo=[];

//buttons

let buttonsDOM=[];


class Products{
    async getProducts(){
        try{
            let response= await fetch('product.json');
            let result = await response.json();
            let products= result.items;
            let data =products.map((product)=>{
                let {id}= product.sys;
                let {title,price,image}=product.fields;
                return {id, title,price,image}
            })
            return data
        }
        catch(error){
            console.log(error)
        }
    }
}


//display products
class UI{
    displayProducts(allProducts){
        let result='';
        allProducts.forEach(prod=>{
            result+=`  
        <div class="img-container">
        <img src=${prod.image} alt="product" class="product-img">
        <button class="bag-btn" data-id=${prod.id}>
        <i class="fas fa-shopping-cart"></i>
        add to cart
        </button> 
        <div class="product">
        <h3>${prod.title}</h3>
        <h4>${prod.price}</h4>
        </div>
        </div>`
        })
        return productsCent.innerHTML=result;
        
    
    
    }
    getBagButtons(){
        const buttons= [...document.querySelectorAll(".bag-btn")];
        buttonsDOM=buttons;
        buttons.forEach(button=>{
            let id= button.dataset.id;
            let inCart = cartInfo.find(item=>item.id===id) 
            if(inCart){
                button.innerText=" In Cart";
                button.disabled =  true;
            }
            else{
                button.addEventListener('click',(event)=>{
                    event.target.innerText="In Cart";
                    event.target.disabled=true;
                    
                    //get product from products
                    let cartItem={...Storage.getProduct(id),amount:1};
                    
                    //add product to the cart
                    cartInfo=[...cartInfo,cartItem];

                    //save cart to the storage.

                    Storage.saveCart(cartInfo)

                    //set cart values

                    this.setCartValues(cartInfo)


                    //display cart items
                    this.addCartItem(cartItem)


                    //show the cart
                    this.showCart()


                })
            }
        })
        

    }
    setCartValues(cartInfo){
        let tempTotal=0;
        let itemsTotal=0;
        cartInfo.map((item)=>{
            tempTotal+=item.price*item.amount;
            itemsTotal+=item.amount;
        })
        cartTotal.innerText= parseFloat(tempTotal.toFixed(2))
        cartItems.innerText=itemsTotal;
    }

    addCartItem(item){
        const div =document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML=`<img src=${item.image} alt="product">
            
            <div><h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div class="cart-icons"> 
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
    
        <p class="item-amount">${item.amount}</p>

            <i class="fas fa-chevron-down" data-id=${item.id}></i>

        </div>`
            cartContent.appendChild(div)

    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart')
    }
    setupApp(){
        cartInfo= Storage.getCart();
        this.setCartValues(cartInfo);
        this.populateCart(cartInfo);
        cartBtn.addEventListener('click',this.showCart)
        clearCartBtn.addEventListener('click',this.clearCart)
        
        

    }
    populateCart(cartInfo){
        cartInfo.forEach(item=>this.addCartItem(item))
        closeCartBtn.addEventListener('click',this.hideCart)

    }
    hideCart(){
        cartDOM.classList.remove('showCart');
        cartOverlay.classList.remove('transparentBcg')}

    cartLogic(){
        clearCartBtn.addEventListener('click', ()=>{
            this.clearCart();
        }
        )
        //CART FUNCTIONALITY
        cartContent.addEventListener('click', event=>{
            if(event.target.classList.contains("remove-item")){
                let removeItem= event.target;
                let id= removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            }
            else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount= event.target;
                let id= addAmount.dataset.id;
                let tempItem = cartInfo.find(item=>item.id===id);
                tempItem.amount= tempItem.amount+1;
                Storage.saveCart(cartInfo);
                this.setCartValues(cartInfo)
                addAmount.nextElementSibling.innerText=tempItem.amount;
            }
            else if(event.target.classList.contains("fa-chevron-down")){
                let reduceAmount= event.target;
                let id= reduceAmount.dataset.id;
                let tempItem = cartInfo.find(item=>item.id===id);
                tempItem.amount= tempItem.amount-1;
                if(tempItem.amount>0){
                    Storage.saveCart(cartInfo);
                    this.setCartValues(cartInfo)
                    reduceAmount.previousElementSibling.innerText=tempItem.amount;  
                }
                else{
                    cartContent.removeChild(reduceAmount.parentElement.parentElement)
                }
            }
        })
    }

    clearCart(){
        let cartInfoItems= cartInfo.map(item=>item.id);
        cartInfoItems.forEach((id)=>{this.removeItem(id)})
        console.log(cartInfoItems)
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id){
        cartInfo=cartInfo.filter(item =>item.id!==id);
        console.log(cartInfo);
        Storage.saveCart(cartInfo); 
        this.setCartValues(cartInfo); 
        let button= this.getSingleButton(id);
        button.disabled=false;
        button.innerHTML= `<i class="fas fa-shopping-cart"></i>
        add to cart`;

    }
    getSingleButton(id){
        return buttonsDOM.find(button=>button.dataset.id===id)
    }
}
//local storage------------------------------------------------------------
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products))

    }
    static getProduct(id){
        let products= JSON.parse(localStorage.getItem('products'))
        return products.find(product=>product.id===id)
    }

    static saveCart(cartData){
        localStorage.setItem("cartItems", JSON.stringify(cartData));

    }

    static getCart(){
        return localStorage.getItem('cartItems')? JSON.parse(localStorage.getItem('cartItems')):[];
    }

}
document.addEventListener("DOMContentLoaded", ()=>{

    const products= new Products();
    const ui = new UI();
    //set up app
    ui.setupApp();
    
    //get all products
    products.getProducts().then(data=> {
                ui.displayProducts(data);
                Storage.saveProducts(data);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
            }).catch(error=>console.log(error))


})
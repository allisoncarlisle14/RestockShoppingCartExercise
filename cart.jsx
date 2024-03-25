// simulate getting products from DataBase
const products = [
  { name: "Coffee", country: "Brazil", cost: 3, instock: 10 },
  { name: "Oranges", country: "Brazil", cost: 2, instock: 3 },
  { name: "Raspberries", country: "Mexico", cost: 4, instock: 5 },
  { name: "Grapes", country: "China", cost: 2, instock: 8 },
];
//=========Cart=============

// // Allison note: Is Cart component ever used-- doesn't look like it?
// const Cart = (props) => {
//   const { Card, Accordion, Button } = ReactBootstrap;
//   let data = props.location.data ? props.location.data : products;
//   console.log(`data:${JSON.stringify(data)}`);

//   return <Accordion defaultActiveKey="0">{list}</Accordion>;
// };

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name); // this returns an array with one object inside
    console.log(`add to Cart ${JSON.stringify(item)}`);

    if (item[0].instock > 0) {
      let updatedStock = item[0].instock-1;
      setItems(items.map(product => product.name == name ? {...product, instock: updatedStock} : product));
      setCart([...cart, ...item]);
      //doFetch(query);
    } else {
      alert (`The store is out of ${name}!`);
    }
    
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
    let returnedItem = cart.filter((cartItem, i) => index == i);
    let name = returnedItem[0].name;
    let item = items.filter((item) => item.name == name);
    let updatedStock = item[0].instock+1;
    setItems(items.map(product => product.name == name ? {...product, instock: updatedStock} : product));
  };
  const photos = [
    "https://picsum.photos/id/425/200/300",
    "https://picsum.photos/id/517/200/300",
    "https://picsum.photos/id/429/200/300",
    "https://picsum.photos/id/75/200/300",
  ];

  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={photos[index % 4]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}:${item.cost}: In Stock: {item.instock}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Accordion.Item key={1 + index} eventkey={1 + index}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body
          onClick={() => deleteCartItem(index)}
          eventkey={1 + index}
        >
          $ {item.cost} from {item.country}: (Click to delete from cart.)
        </Accordion.Body>
      </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  
  //TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    // Important! data was NOT an array. I had to do data.data because data is actually an object, whose first property is an array called data!
    let newItems = data.data.map((item) => {
    let name = item.attributes.name;
    let country = item.attributes.country;
    let cost = item.attributes.cost;
    let instock = item.attributes.instock;
    return {name, country, cost, instock};
  });
    setItems([...items, ...newItems]);
  };

  
  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));

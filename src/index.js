import React, { Component } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "./index.css";
import { usePromiseTracker } from "react-promise-tracker";
import { trackPromise } from "react-promise-tracker";
import Loader from "react-loader-spinner";

const averageCat = (data, param) => {
  let total = 0;
  let avg = 0;
  if (param === "life") {
    let kg = data.life_span.split("-");
    for (let i of kg) {
      total += parseInt(i.trim());
    }
    avg = total / kg.length;
    return avg;
  } else if (param === "weight") {
    let split = data.weight.metric.split("-");
    for (let i of split) {
      total += parseInt(i.trim());
    }
    avg = total / split.length;
    return avg;
  }
};

const Header = ({ data }) => {
  let avgLife = 0;
  let avgWeight = 0;

  if (data.length > 0) {
    for (let i of data) {
      avgLife += averageCat(i, "life");
      avgWeight += averageCat(i, "weight");
    }
    avgWeight /= data.length;
    avgLife /= data.length;
  }
  return (
    <div className="header-wrapper">
      <h2>Cats Paradise</h2>
      <p>There are {data.length} cats in the API</p>
      <small>
        On average a cat can weight about <span>{avgWeight.toFixed(2)}</span> Kg
        and lives <span>{avgLife.toFixed(2)}</span> years.
      </small>
    </div>
  );
};

const Cat = ({
  cat: {
    name,
    origin,
    temperament,
    description,
    life_span: life,
    weight: { metric: kg },
  },
  urlImg,
}) => {
  const { promiseInProgress } = usePromiseTracker();
  return (
    !promiseInProgress && (
      <div className="cat-wrapper">
        <div className="cat-card">
          <span className="catimg">
            <img src={urlImg} alt={name} />
          </span>
          <div className="cat-data">
            <h3>{name.toUpperCase()}</h3>
            <h4>
              <span className="cat-title">Origin: </span>
              {origin}
            </h4>
            <p>
              <span className="cat-title">Temperament: </span>
              {temperament}
            </p>
            <p id="desc">
              <span className="cat-title">Description: </span>
              {description}
            </p>
            <p>
              <span className="cat-title">Weight: </span>
              {kg}
            </p>
            <p>
              <span className="cat-title">Lifespan: </span>
              {life}
            </p>
          </div>
        </div>
      </div>
    )
  );
};

const LoadingIndicator = (props) => {
  const { promiseInProgress } = usePromiseTracker();

  return (
    promiseInProgress && (
      <>
        <div class="loader">
          <Loader type="ThreeDots" color="#f05454" height="200" width="200" />
        </div>
      </>
    )
  );
};

class App extends Component {
  state = {
    data: [],
    img: {},
  };

  componentDidMount() {
    trackPromise(this.fetchCats());
  }

  fetchCats = async () => {
    const url = "https://api.thecatapi.com/v1/breeds";
    try {
      const response = await axios.get(url);
      const data = await response.data;

      console.log(data);
      this.setState({ data: data });

      let urls = [];
      let k = 0;
      for (let i of this.state.data) {
        urls[
          k++
        ] = `https://api.thecatapi.com/v1/images/search?breed_id=${i.id}`;
      }
      const _reqs = urls.map((url) => {
        return axios.get(url).catch((e) => {
          console.log(e);
        });
      });

      const responses = await axios.all(_reqs);

      const data2 = responses.map((res) => {
        return res.data;
      });
      let final = [];
      for (let i of data2) {
        final.push(i[0].url);
      }
      // console.log(final[0].url);
      this.setState({
        img: final,
      });
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const { data, img } = this.state;
    return (
      <div className="App">
        <Header data={this.state.data} />
        <div className="cats-wrapper">
          <LoadingIndicator />
          {data.map((val, i) => {
            return <Cat cat={val} urlImg={img[i]} key={i} />; // ca sa iterez al doilea response ar trebui sa am img[i] dar am eroare daca pun asa: Objects are not valid as a React child (found: object with keys {data, status, statusText, headers, config, request}). If you meant to render a collection of children, use an array instead.
          })}
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

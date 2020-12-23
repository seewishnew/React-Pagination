import React, { useState, useEffect } from "react";
import "./styles.css";

const axios = require("axios");
const _ = require("lodash");
const uriEndPoint = "https://lz82x.sse.codesandbox.io/";

let sessionToken;

export default function App() {
  let [query, setQuery] = useState("");
  let [isSending, setIsSending] = useState(false);
  let [page, setPage] = useState(0);
  let [listings, setListings] = useState([]);
  let [isTokenGenerated, setIsTokenGenerated] = useState(false);

  //{"property_type": "House"}
  const getToken = () => {
    setIsSending(true);
    axios.get(uriEndPoint).then((resp) => {
      console.log(resp.data);
      sessionToken = resp.data.token;
      setIsSending(false);
      setIsTokenGenerated(true);
    });
  };
  const sendRequest = () => {
    setIsSending(true);
    console.log("query: ", query, typeof query, {
      token: sessionToken,
      ...JSON.parse(query)
    });
    axios
      .get(uriEndPoint, {
        params: {
          token: sessionToken,
          ...JSON.parse(query)
        }
      })
      .then((resp) => {
        console.log("resp.data: ", resp.data);
        setListings(resp.data.results);
        setPage(resp.data.page);
      })
      .then(() => setIsSending(false))
      .catch((e) => {
        console.log("Error: ", e);
        setIsSending(false);
      });
  };

  _.debounce(sendRequest, 500);
  const handleOnQueryChange = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    getToken();
    return () => {
      axios
        .post(uriEndPoint + "unsubscribe", { token: sessionToken })
        .then(() => console.log("unsubscribed successfully!"));
    };
  }, []);
  return (
    <div className="App">
      <div className="container-fluid">
        <div className="row m-2">
          <input
            className="col-4 offset-4"
            placeholder="Search"
            value={query}
            onChange={handleOnQueryChange}
          ></input>
          <button
            disabled={isSending}
            className="btn btn-primary col-2 ms-2"
            onClick={sendRequest}
          >
            Search!
          </button>
        </div>
        <div className="row">
          <div style={{ visibility: isSending ? "visible" : "hidden" }}>
            Loading...
          </div>
          {isTokenGenerated ? (
            <div>
              {" "}
              Showing page {page} with {listings.length} results.{" "}
            </div>
          ) : (
            <div> Generating token...</div>
          )}
        </div>
        <div className="row">
          {listings.map((obj, idx) => {
            return (
              <div className="col-md-6 col-xl-3 mb-3" key={idx}>
                <div className="card">
                  <div
                    // alt="listing"
                    className="card-img-top img-card"
                    style={{ background: `url(${obj.images.picture_url})` }}
                  />
                  <div className="card-body">
                    <h5 className="card-title title-card">{obj.name}</h5>
                    {/* <p className="card-text">Price: {obj.price}</p> */}
                    {/* <a href="#" class="btn btn-primary">
                    Go somewhere
                  </a> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

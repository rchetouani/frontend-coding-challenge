import React from "react";
import "./App.css";
import { Component } from "react";
import request from "superagent";
import moment from "moment";
import Spinner from "react-spinner-material";

class App extends Component {
  constructor(props) {
    super(props);

    // Sets up our initial state
    this.state = {
      error: false,
      hasMore: true,
      isLoading: false,
      repositories: [],
      page: 1
    };

    // Binds our scroll event handler
    window.onscroll = () => {
      const {
        loadUsers,
        state: { error, isLoading, hasMore }
      } = this;

      // Bails early if:
      // * there's an error
      // * it's already loading
      // * there's nothing left to load
      if (error || isLoading || !hasMore) return;

      // Checks that the page has scrolled to the bottom
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
      ) {
        loadUsers();
      }
    };
  }

  componentWillMount() {
    // Loads some repositories on initial load
    this.loadUsers();
  }

  loadUsers = () => {
    var fetchDate = moment()
      .subtract(30, "days")
      .format("YYYY-MM-DD");
    var sourceUrl =
      "https://api.github.com/search/repositories?q=created:>" +
      fetchDate +
      "&sort=stars&order=desc" +
      (this.state.page > 1 ? "&page=" + this.state.page : "");
    this.setState({ isLoading: true }, () => {
      request
        .get(sourceUrl)
        .then(results => {
          // Creates a massaged array of repository data
          const nextUsers = results.body.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            stargazers_count: item.stargazers_count,
            open_issues_count: item.open_issues_count,
            ownerlogin: item.owner.login,
            photo: item.owner.avatar_url,
            created_at: item.created_at,
            html_url: item.html_url,
            ownerhtml_url: item.owner.html_url
          }));

          // Merges the next repositories into our existing repositories
          this.setState({
            // Note: Depending on the API you're using, this value may be
            // returned as part of the payload to indicate that there is no
            // additional data to be loaded
            hasMore: true,
            isLoading: false,
            repositories: [...this.state.repositories, ...nextUsers],
            page: this.state.page + 1
          });
        })
        .catch(err => {
          this.setState({
            error: err.message,
            isLoading: false
          });
        });
    });
  };

  render() {
    const { error, hasMore, isLoading, repositories } = this.state;

    return (
      <>
        {repositories.map(repository => (
          <div id="container" key={repository.id}>
            <div className="repository-image">
              <img src={repository.photo} alt="repository" />
            </div>
            <div className="repository-details">
              <a href={repository.html_url}>
                <h1>{repository.name}</h1>
              </a>
              <p className="information">{repository.description} </p>

              <div className="control">
                <button className="btn">
                  <span className="star">
                    stars : {repository.stargazers_count}
                  </span>
                  <span>
                    <i aria-hidden="true" />
                  </span>
                  <span className="issue">
                    {" "}
                    Issues : {repository.open_issues_count}
                  </span>
                </button>
                <span className="issue">
                  {" "}
                  Submitted{" "}
                  {moment(new Date()).diff(repository.created_at, "days")} days
                  ago by
                  <a href={repository.ownerhtml_url}>
                    {" "}
                    {repository.ownerlogin}
                  </a>{" "}
                </span>
              </div>
            </div>
          </div>
        ))}
        <hr />
        {error && <div style={{ color: "#900" }}>{error}</div>}
        {isLoading && (
          <div className="Spinner">
            <Spinner
              size={50}
              spinnerColor={"blue"}
              spinnerWidth={2}
              visible={true}
            />
          </div>
        )}
        {!hasMore && <div>You did it! You reached the end!</div>}
      </>
    );
  }
}

export default App;

var ServerList = React.createClass({displayName: "ServerList",
  render: function() {
    return (
      React.createElement("div", {className: "ServerList"}, 
        "Hello, world! I am a ServerList!"
      )
    );
  }
});
React.render(
  React.createElement(ServerList, null),
  document.getElementById('content')
);

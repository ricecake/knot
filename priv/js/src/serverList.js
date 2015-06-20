var ServerList = React.createClass({
  render: function() {
    return (
      <div className="ServerList">
        Hello, world! I am a ServerList!
      </div>
    );
  }
});
React.render(
  <ServerList />,
  document.getElementById('content')
);

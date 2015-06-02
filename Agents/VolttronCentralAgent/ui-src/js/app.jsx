'use strict';

var React = require('react');
var Router = require('react-router');

var authorizationStore = require('./stores/authorization-store');
var LoginForm = require('./components/login-form');
var PageNotFound = require('./components/page-not-found');
var Platform = require('./components/platform');
var PlatformManager = require('./components/platform-manager');
var Platforms = require('./components/platforms');

var _afterLoginRoute = 'platforms';

function checkAuth(Component) {
	return React.createClass({
		statics: {
			willTransitionTo: function (transition) {
				if (transition.path !== '/login') {
					_afterLoginRoute = transition.path;

					if (!authorizationStore.getAuthorization()) {
				    	transition.redirect('login');
				    }
				} else if (transition.path === '/login' && authorizationStore.getAuthorization()) {
				    transition.redirect(_afterLoginRoute);
				}
			},
		},
		render: function () {
			return (
				<Component {...this.props} />
			);
		},
	});
}

var AfterLogin = React.createClass({
	statics: {
		willTransitionTo: function (transition) {
			transition.redirect(_afterLoginRoute);
		},
	},
	render: function () {},
});

var routes = (
	<Router.Route path="/" handler={PlatformManager}>
		<Router.Route name="login" path="login" handler={checkAuth(LoginForm)} />
		<Router.Route name="platforms" path="platforms" handler={checkAuth(Platforms)} />
		<Router.Route name="platform" path="platforms/:uuid" handler={checkAuth(Platform)} />
		<Router.NotFoundRoute handler={checkAuth(PageNotFound)} />
		<Router.DefaultRoute handler={AfterLogin} />
	</Router.Route>
);

var router = Router.create(routes);

router.run(function (Handler) {
	React.render(
	    <Handler />,
	    document.getElementById('app')
	);
});

authorizationStore.addChangeListener(function () {
	if (!authorizationStore.getAuthorization() && !router.isActive('login')) {
		router.replaceWith('login');
	}
});

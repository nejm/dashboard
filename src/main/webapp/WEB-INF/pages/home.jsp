<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@page session="false"%>
<html>
    <head>
        <title>Dashboard</title>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/startbootstrap-sb-admin-2/3.3.7+1/css/sb-admin-2.min.css">
        <c:url value='/resources/bower/jsPlumb/dist/css/jsplumb.css' var="jsplumbcss" />
        <c:url value='/resources/bower/bootstrap/dist/css/bootstrap.min.css' var="bootstrapcss" />
        <c:url value='/resources/bower/jquery-ui/themes/base/jquery-ui.css' var="jqueryuicss" />
        <c:url value='/resources/css/style.css' var="style" />
        <c:url value='/resources/css/font-awesome.min.css' var="font" />

        <link href="${jsplumbcss}" rel="stylesheet" />
        <link href="${bootstrapcss}" rel="stylesheet" />
        <link href="${jqueryuicss}" rel="stylesheet" />
        <link href="${style}" rel="stylesheet" />
        <link href="${font}" rel="stylesheet" />

        <!--<link href="//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css" rel="stylesheet">-->
        <link href="https://cdn.datatables.net/1.10.13/css/dataTables.bootstrap4.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/css/bootstrap-select.min.css">
        <c:url value='/resources/css/sweetalert.css' var="alertcss" />
        <link href="${alertcss}" rel="stylesheet" />

    </head>

    <body style="height:100%;">
        <nav class="navbar navbar-default" role="navigation"
             style="margin-bottom: 0">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse"
                        data-target=".navbar-ex1-collapse">
                    <span class="sr-only">Toggle navigation</span> <span
                        class="icon-bar"></span> <span class="icon-bar"></span> <span
                        class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">Dashboard</a>
            </div>

            <ul class="nav navbar-right top-nav">
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle"
                       data-toggle="dropdown"><i class="fa fa-user">
                        </i> ${user} <b class="caret"></b></a>
                    <ul class="dropdown-menu">
                        <li>
                            <a href="#">
                                <i class="fa fa-fw fa-user">
                                </i> 
                                Profile
                            </a>
                        </li>
                        <li class="divider"></li>
                        <li><a href="javascript:formSubmit()"><i class="fa fa-fw fa-power-off">
                                </i> Log Out</a></li>
                    </ul>
                </li>
            </ul>
        </nav>
        <div ng-controller="FirstExampleController" style="height:100%;">
            <div class="col-sm-3" ng-include="'/Dashboard/resources/partials/sidebar.html'" 
                 style="height:150%; overflow:auto" >      
            </div>
            <div class="col-sm-9" class="row">
                <div class="panel panel-primary" style="height:100%;">
                    <div class="panel-heading"  style="height: 50px">
                        <h3 class="panel-title">
                            {{dashboardName}}
                        </h3>
                        <div class="pull-right" style="margin-top: -20px">
                            <button class="btn btn-default"  ng-click = "saveState()">
                                Enregistrer
                            </button>
                        </div>
                    </div>
                    <div class="panel-body" style="overflow:hidden; height : 800px;" id='canvasbody'>
                        <js-plumb-canvas on-connection="onConnection" x="pos_x" y="pos_y" zoom="zoomlevel">
                            <ng-include src="'/Dashboard/resources/partials/'+state.template+'State.html'" ng-repeat="state in stateObjects"></ng-include>
                        </js-plumb-canvas>
                    </div>
                </div>
            </div>
        </div>
       <c:url value="/logout" var="logoutUrl" />
	<form action="${logoutUrl}" method="post" id="logoutForm">
		<input type="hidden" name="${_csrf.parameterName}"
			value="${_csrf.token}" />
	</form>
        <!-- quick CDN stuff for angular/touchpunch/jquery/jqueryui -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
        <script src="https://cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/2.5.0/ui-bootstrap-tpls.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/js/bootstrap-select.min.js"></script>
        <script src="https://cdn.datatables.net/1.10.13/js/dataTables.bootstrap.min.js"></script>
        <script src="https://cdn.datatables.net/responsive/1.0.7/js/dataTables.responsive.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js"></script>
        <!-- bower installed -->
        <script src="<c:url value="/resources/bower/jsPlumb/dist/js/jquery.jsPlumb-1.6.2.js"/>"></script>
        <script src="<c:url value="/resources/bower/angular-ui-slider/src/slider.js"/>"></script>
        <script src="<c:url value="/resources/js/query.js"/>"></script>
        <script src="<c:url value="/resources/js/angular-chart.min.js"/>"></script>

        <!-- out local ng stuff -->
        <script src="<c:url value="/resources/js/ngstorage.js"/>"></script>
        <script src="<c:url value="/resources/js/directives.js"/>"></script>

        <script src="<c:url value="/resources/js/app.js"/>"></script>
        <script src="<c:url value="/resources/js/firstController.js"/>"></script>

        <script src="<c:url value="/resources/js/bootstrap-select.js"/>"></script>
        <script src="<c:url value="/resources/js/waiting.js"/>"></script>
        <script src="<c:url value="/resources/js/sweetalert.min.js"/>"></script>
        <script src="<c:url value="/resources/js/waiting.js"/>"></script>
        <script>
            function formSubmit() {
                document.getElementById("logoutForm").submit();
            }
        </script>
    </body>
</html>
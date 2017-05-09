package com.smi.controller;

import com.smi.model.Dashboard;
import com.smi.model.DashboardStat;
import com.smi.model.DashboardUser;
import com.smi.model.Statistique;
import com.smi.model.Users;
import com.smi.model.Usersandroles;
import com.smi.service.DashboardService;
import com.smi.service.DashboardStatService;
import com.smi.service.DashboardUserService;
import com.smi.service.RoleService;
import com.smi.service.ServiceService;
import com.smi.service.StatUserService;
import com.smi.service.StatistiqueService;
import com.smi.service.UserAndRoleService;
import com.smi.service.UserService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {
    
    final static Logger logger = Logger.getLogger(DashboardController.class);

    @Autowired
    @Qualifier("statService")
    StatistiqueService statistiqueService;

    @Autowired
    @Qualifier("usersService")
    UserService userService;

    @Autowired
    @Qualifier("roleService")
    RoleService roleService;

    @Autowired
    @Qualifier("statuserService")
    StatUserService statUserService;

    @Autowired
    @Qualifier("dashboardService")
    DashboardService dashboardService;

    @Autowired
    @Qualifier("dashboardUserService")
    DashboardUserService dashboardUserService;

    @Autowired
    @Qualifier("dashboardStatService")
    DashboardStatService dashboardStatService;

    @Autowired
    @Qualifier("serviceService")
    ServiceService serviceService;

    @Autowired
    @Qualifier("userAndRoleService")
    UserAndRoleService userAndRoleService;
    
    @RequestMapping(value = "/rest/dashboards/{id}", method = RequestMethod.GET)
    public JSONObject getDashboards(@PathVariable Long id) {
        JSONObject object = new JSONObject();
        Dashboard dashboard = dashboardService.getDashboard(id);
        List<DashboardStat> stats = dashboardStatService.getByDashboardId(id);
        List<Statistique> statistiques = new LinkedList<Statistique>();
        for (DashboardStat stat : stats) {
            statistiques.add(statistiqueService.findById(stat.getIdStat()));
        }
        object.put("dashboard", dashboard);
        object.put("stats", statistiques);
        return object;
    }

    @RequestMapping(value = "/rest/dashboards/available/{username}", method = RequestMethod.GET)
    public List<Dashboard> getAvailableDashboards(@PathVariable String username) {
        Users user = userService.findByUsername(username);
        if(user.getProfile() == 'A'){
            return dashboardService.getAllDashboards();
        }
        List<DashboardUser> dashboardUsers = dashboardUserService.getByUser(username);
        List<Usersandroles> usersandroleses = userAndRoleService.findByUser(user.getUserId());

        for (Usersandroles uar : usersandroleses) {
            if (uar.getUserId() == user.getUserId()) {
                dashboardUsers.addAll(dashboardUserService.getByRole(roleService.findById(uar.getRoleId()).getRoleName()));
            }

        }

        List<Dashboard> dashboards = new ArrayList<>();
        for (DashboardUser du : dashboardUsers) {
            dashboards.add(dashboardService.getDashboard(du.getIdDashboard()));
        }
        return dashboards;
    }

    @RequestMapping(value = "/rest/dashboard/save", method = RequestMethod.POST)
    public Long saveDashboard(@RequestBody Dashboard dashboard) {
        System.out.println("com.smi.controller.AngularController.getDashboards()" + dashboard);
        return dashboardService.save(dashboard);
    }
    
    @RequestMapping(value = "/rest/dashboard/edit", method = RequestMethod.POST)
    public void editDashboard(@RequestBody Dashboard dashboard) {
        System.out.println("com.smi.controller.AngularController.editDashboard()"+dashboard);
//        List<DashboardStat> dashboardStats = dashboardStatService.getByDashboardId(dashboard.getId());
//        for(DashboardStat d : dashboardStats){
//            dashboardStatService.delete(d);
//        }
        dashboardService.edit(dashboard);
    }
    
    @RequestMapping(value = "/rest/dashboard/exist/{name}", method = RequestMethod.GET)
    public Boolean existDashboard(@PathVariable String name) {
        return dashboardService.doesExist(name);
    }

    @RequestMapping(value = "/rest/dashboard/partage", method = RequestMethod.POST)
    public void partageDashboard(@RequestBody JSONObject o) {
        List<HashMap<String, String>> roles = (List<HashMap<String, String>>) o.get("profiles");
        List<HashMap<String, String>> users = (List<HashMap<String, String>>) o.get("users");
        DashboardUser dashboardUser = new DashboardUser();
        //System.out.println("com.smi.controller.AngularController.partageDashboard()"+roles);
        dashboardUser.setIdDashboard(Long.parseLong(o.get("id_dashboard").toString()));
        for (HashMap<String, String> s : roles) {
            dashboardUser.setRoleName(s.get("roleName"));
            //System.out.println("L 165 : "+s.get("roleName"));
            dashboardUserService.save(dashboardUser);
        }
        dashboardUser.setRoleName("");
        for (HashMap<String, String> s : users) {
            dashboardUser.setUsername(s.get("username"));
            dashboardUserService.save(dashboardUser);
            //System.out.println("L 172 "+s.get("username"));
        }
    }

    @RequestMapping(value = "/rest/dashboard/saveStat", method = RequestMethod.POST)
    public void statDashboard(@RequestBody JSONObject o) {
        DashboardStat ds = new DashboardStat();
        ds.setIdDashboard(Long.parseLong(o.get("id_dashboard").toString()));
        List<String> stats = (List<String>) o.get("statistiques");
        for (String idStat : stats) {
            ds.setIdStat(Long.parseLong(idStat));
            dashboardStatService.save(ds);
        }
    }
   
}

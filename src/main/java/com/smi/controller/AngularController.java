package com.smi.controller;

import com.smi.dao.UserAndRoleDao;
import com.smi.model.*;
import com.smi.service.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AngularController {

    final static Logger logger = Logger.getLogger(AngularController.class);

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
    @Qualifier("ressourceService")
    RessourceService ressourceService;

    @Autowired
    @Qualifier("serviceService")
    ServiceService serviceService;

    @Autowired
    @Qualifier("userAndRoleService")
    UserAndRoleService userAndRoleService;

    @RequestMapping(value = "/rest/statistique", method = RequestMethod.GET)
    public ResponseEntity<List<Statistique>> getAll() {
        List<Statistique> stats = statistiqueService.findAll();
        return new ResponseEntity<List<Statistique>>(stats, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/users", method = RequestMethod.GET)
    public ResponseEntity<List<Users>> getAllUsers() {
        List<Users> stats = userService.findAll();
        return new ResponseEntity<List<Users>>(stats, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/roles", method = RequestMethod.GET)
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.findAll();
        return new ResponseEntity<List<Role>>(roles, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/statistique/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Statistique> getById(@PathVariable Long id) {
        Statistique stat = statistiqueService.findById(id);
        return new ResponseEntity<Statistique>(stat, HttpStatus.OK);
    }

    //get the statistiques created by a user
    @RequestMapping(value = "/rest/statistique/created/{name}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Statistique>> getByName(@PathVariable String name) {
        List<Statistique> stats = statistiqueService.findMyStat(name);
        return new ResponseEntity<List<Statistique>>(stats, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/statistique/available/{name}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<HashMap<String, List<Statistique>>> getAvailableStats(@PathVariable String name) {
        name = name.toLowerCase();
        Users user = userService.findByUsername(name);
        HashMap<String, List<Statistique>> availableStats = new LinkedHashMap<>();
        List<Statistique> statistiques = new ArrayList<>();
        List<Statuser> stats;
        if (user.getProfile() == 'A') {
            statistiques.addAll(statistiqueService.findAll());
        } else {

            stats = statUserService.findByUser(name);
            // available by user

            for (Statuser s : stats) {
                statistiques.add(statistiqueService.findById(s.getIdStat()));
            }
        }
        availableStats.put(name, statistiques);

        // available by role
        if (user.getProfile() == 'A') {
            stats = new ArrayList<>();
            List<Statistique> availableStatsByRole;
            for (Role r : roleService.findAll()) {
                availableStatsByRole = new ArrayList<>();
                stats.addAll(statUserService.findByRole(r.getRoleName()));
                for (Statuser stat : stats) {
                    availableStatsByRole.add(statistiqueService.findById(stat.getIdStat()));
                }
                availableStats.put(r.getRoleName(), availableStatsByRole);
            }
        } else {
            List<Usersandroles> usersAndRoles = userAndRoleService.findByUser(userService.findByUsername(name).getUserId());
            String role;
            stats = new ArrayList<>();
            List<Statistique> availableStatsByRole;

            for (Usersandroles uar : usersAndRoles) {
                availableStatsByRole = new ArrayList<>();
                if (uar.getUserId() == user.getUserId()) {
                    role = roleService.findById(uar.getRoleId()).getRoleName();
                    stats.addAll(statUserService.findByRole(role));
                    for (Statuser stat : stats) {
                        availableStatsByRole.add(statistiqueService.findById(stat.getIdStat()));
                    }
                    availableStats.put(role, availableStatsByRole);
                }
            }
        }

        return new ResponseEntity<HashMap<String, List<Statistique>>>(availableStats, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/statistique", method = RequestMethod.POST)
    public ResponseEntity<Long> createStat(@RequestBody Statistique stat) {
        Long id = statistiqueService.add(stat);
        return new ResponseEntity<Long>(id, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/statistique/edit", method = RequestMethod.POST)
    public void updateStat(@RequestBody Statistique stat) {
        statistiqueService.edit(stat);
    }

    @RequestMapping(value = "/rest/statistique/partage", method = RequestMethod.POST)
    public void partage(@RequestBody JSONObject o) {
        List<HashMap<String, String>> roles = (List<HashMap<String, String>>) o.get("profiles");
        List<HashMap<String, String>> users = (List<HashMap<String, String>>) o.get("users");
        Statuser statuser = new Statuser();
        statuser.setIdStat(Long.parseLong(o.get("id_stat").toString()));
        for (HashMap<String, String> s : roles) {
            statuser.setRolename(s.get("roleName"));
            statUserService.save(statuser);
            System.out.println("roles ::: " + statuser.toString());
        }
        statuser.setRolename("");
        for (HashMap<String, String> s : users) {
            statuser.setUsername(s.get("username"));
            statUserService.save(statuser);
        }
    }

    @RequestMapping(value = "/rest/rolesanduser", method = RequestMethod.GET)
    public HashMap<String, List<String>> hasRole() {
        HashMap<String, List<String>> map = new HashMap<>();
        List<Users> users = userService.findAll();
        List<String> l;
        List<Usersandroles> usersandroleses = userAndRoleService.findByUser(Long.MIN_VALUE);
        List<Role> roles = roleService.findAll();

        for (Users u : users) {
            l = new ArrayList<>();
            for (Usersandroles uar : usersandroleses) {
                if (uar.getUserId() == u.getUserId()) {
                    for (Role r : roles) {
                        if (uar.getRoleId() == r.getRoleId()) {
                            l.add(r.getRoleName());
                            break;
                        }
                    }
                }
            }
            map.put(u.getUsername(), l);
        }

        return map;
    }

    @RequestMapping(value = "/rest/statistiques/{name}", method = RequestMethod.GET)
    public ResponseEntity<Boolean> existingService(@PathVariable String name) {
        return new ResponseEntity<Boolean>(statistiqueService.exist(name), HttpStatus.OK);
    }

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
    public Long getDashboards(@RequestBody Dashboard dashboard) {
        System.out.println("com.smi.controller.AngularController.getDashboards()" + dashboard);
        return dashboardService.save(dashboard);
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

    //ressources
    @RequestMapping(value = "/rest/ressources", method = RequestMethod.GET)
    public ResponseEntity<List<Ressources>> getAllRessources() {
        List<Ressources> ressources = ressourceService.findAll();
        return new ResponseEntity<List<Ressources>>(ressources, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/ressources/update", method = RequestMethod.POST)
    public void updateService(@RequestBody Ressources ressource) {
        ressourceService.edit(ressource);
    }

    @RequestMapping(value = "/rest/ressources/save", method = RequestMethod.POST)
    public Long addService(@RequestBody Ressources ressource) {
        return ressourceService.save(ressource);
    }

    @RequestMapping(value = "/rest/ressources/delete", method = RequestMethod.POST)
    public void deleteService(@RequestBody Ressources ressource) {
        ressourceService.delete(ressource);
    }

    //services
    @RequestMapping(value = "/rest/services", method = RequestMethod.GET)
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceService.findAll();
        return new ResponseEntity<List<Service>>(services, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/services/update", method = RequestMethod.POST)
    public void updateService(@RequestBody Service service) {
        serviceService.edit(service);
    }

    @RequestMapping(value = "/rest/services/save", method = RequestMethod.POST)
    public Long addService(@RequestBody Service service) {
        return serviceService.save(service);
    }

    @RequestMapping(value = "/rest/services/delete", method = RequestMethod.POST)
    public void deleteService(@RequestBody Service service) {
        serviceService.delete(service);
    }
}

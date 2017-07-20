package com.smi.controller;

import com.smi.dao.UserAndRoleDao;
import com.smi.model.*;
import com.smi.service.*;
import java.sql.Statement;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
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
        List<Role> listRoles = null;
        if (user.getProfile() == 'A') {
            listRoles = roleService.findAll();
        } else {
            listRoles = new ArrayList<>();
            List<Usersandroles> usersAndRoles = userAndRoleService.findByUser(userService.findByUsername(name).getUserId());
            for (Usersandroles uar : usersAndRoles) {
                if (uar.getUserId() == user.getUserId()) {
                    listRoles.add(roleService.findById(uar.getRoleId()));
                }
            }
        }

        for (Role r : listRoles) {
            List<Statistique> statistique = new ArrayList<>();
            stats = new ArrayList<>();
            stats = statUserService.findByRole(r.getRoleName());
            for (Statuser s : stats) {
                statistique.add(statistiqueService.findById(s.getIdStat()));
            }
            availableStats.put(r.getRoleName(), statistique);
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

    @RequestMapping(value = "/rest/statistiques/delete", method = RequestMethod.POST)
    public void deleteStat(@RequestBody Statistique stat) {
        for (Statuser statuser : statUserService.findByStats(stat.getId())) {
            statUserService.delete(statuser);
        }
        for (DashboardStat dash : dashboardStatService.findByStatId(stat.getId())) {
            dashboardStatService.delete(dash);
        }
        statistiqueService.delete(stat);
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

    //ressources
    @RequestMapping(value = "/rest/ressources", method = RequestMethod.GET)
    public ResponseEntity<List<Ressources>> getAllRessources() {
        List<Ressources> ressources = ressourceService.findAll();
        return new ResponseEntity<List<Ressources>>(ressources, HttpStatus.OK);
    }

    @RequestMapping(value = "/rest/ressources/update", method = RequestMethod.POST)
    public void updateService(@RequestBody Ressources ressource) {
        System.out.println("com.smi.controller.AngularController.updateService()" + ressource.getLogin());
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

    @RequestMapping(value = "/rest/services/tables", method = RequestMethod.POST)
    public List<String> tableStructure(@RequestBody JSONObject o) throws ClassNotFoundException {
        List<String> list = new ArrayList<>();
        String server = (String) o.get("server");
        String username = (String) o.get("username");
        String password = (String) o.get("password");
        String databaseName = (String) o.get("databaseName");

        String tableName = (String) o.get("tableName");
        String port = (String) o.get("port");

        System.out.println("the object : " + o);

        if (o.get("type").toString().toLowerCase().equals("oracle")) {
            String driverType = "thin";

            try {
                TableHelper th = new TableHelper(server, username, password, databaseName, driverType, Integer.parseInt(port), tableName);
                return th.getAllResultNames();
            } catch (SQLException ex) {
                list.add("error");
                list.add(ex.getMessage());

                return list;
            }
        } else if (o.get("type").toString().toLowerCase().equals("mysql")) {
            try {
                TableHelper th = new TableHelper(server, username, password, databaseName, "", Integer.parseInt(port), tableName);
                return th.getAllResultNamesMySql();
            } catch (SQLException ex) {
                list.add("error");
                list.add(ex.getMessage());

                return list;
            }
        }
        list.add("blallalalalalalalalalalalalal");
        return list;
    }

    @RequestMapping(value = "/rest/ressource/test", method = RequestMethod.POST)
    public List<String> testConnection(@RequestBody JSONObject o) {
        List<String> errors = new ArrayList<String>();
        String server = (String) o.get("server");
        String username = (String) o.get("username");
        String password = (String) o.get("password");
        String databaseName = (String) o.get("databaseName");

        String tableName = (String) o.get("tableName");
        String port = (String) o.get("port");

        if (o.get("type").toString().toLowerCase().equals("oracle")) {
            String driverType = "thin";
            
            try {
                TableHelper th = new TableHelper(server, username, password, databaseName, driverType, Integer.parseInt(port), tableName);
                if(!th.testConnection()) errors.add("error");
            } catch (SQLException ex) {
                errors.add(ex.getMessage());
            }

        }
        return errors;
    }

    @RequestMapping(value = "/rest/services/tablesdata", method = RequestMethod.POST)
    public HashMap<Integer, List<String>> tableContent(@RequestBody JSONObject o) throws ClassNotFoundException {
        List<String> list = new ArrayList<>();
        HashMap<Integer, List<String>> map = new LinkedHashMap<>();

        String server = (String) o.get("server");
        String username = (String) o.get("username");
        String password = (String) o.get("password");
        String databaseName = (String) o.get("databaseName");

        String tableName = (String) o.get("tableName");
        String port = (String) o.get("port");

        System.out.println("the object : " + o);

        if (o.get("type").toString().toLowerCase().equals("oracle")) {
            String driverType = "thin";

            try {
                TableHelper th = new TableHelper(server, username, password, databaseName, driverType, Integer.parseInt(port), tableName);
                return th.getAllResult();
            } catch (SQLException ex) {
                list.add("error");
                list.add(ex.getMessage());

                map.put(0, list);
                return map;
            }
        } else if (o.get("type").toString().toLowerCase().equals("mysql")) {
            try {
                TableHelper th = new TableHelper(server, username, password, databaseName, "", Integer.parseInt(port), tableName);
                return th.getAllResultMySql();
            } catch (SQLException ex) {
                list.add("error");
                list.add(ex.getMessage());

                map.put(0, list);
                return map;
            }
        }
        return map;
    }
}

package com.smi.controller;

import com.smi.model.Role;
import com.smi.model.Statistique;
import com.smi.model.Statuser;
import com.smi.model.Users;
import com.smi.service.RoleService;
import com.smi.service.StatUserService;
import com.smi.service.StatistiqueService;
import com.smi.service.UserService;
import java.util.List;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AngularController {

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
    
    @RequestMapping(value = "/rest/statistique/created/{name}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Statistique>> getByName(@PathVariable String name) {
        List<Statistique> stats = statistiqueService.findMyStat(name);
        System.out.println(":::::::::::"+stats);
        return new ResponseEntity<List<Statistique>>(stats, HttpStatus.OK);
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
    
    @RequestMapping(value = "/rest/statistique/partage",method = RequestMethod.POST)
    public void partage(@RequestBody JSONObject o){
        List<String> roles = (List<String>) o.get("profiles");
        List<String> users = (List<String>) o.get("users");
        Statuser statuser = new Statuser();
        statuser.setIdStat(Long.parseLong(o.get("id_stat").toString()));
        for(String s : roles){
            statuser.setRolename(s);
            statUserService.save(statuser);
            System.out.println("roles ::: "+statuser.toString());
        }
        statuser.setRolename("");
        for(String s : users){
            statuser.setUsername(s);
            //statUserService.save(statuser);
        }
        
        
    }
    
    @RequestMapping(value = "/rest/statistiques/{name}", method = RequestMethod.GET)
    public ResponseEntity<Boolean> existingService(@PathVariable String name) {
        System.out.println("find :: "+name + " is "+statistiqueService.exist(name));
        return new ResponseEntity<Boolean>(statistiqueService.exist(name), HttpStatus.OK);
    }
}

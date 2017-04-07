package com.smi.controller;

import com.smi.model.Statistique;
import com.smi.service.StatistiqueService;
import com.smi.service.UserService;
import java.util.List;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AngularController {

    @Autowired
    @Qualifier("statService")
    StatistiqueService statistiqueService;
    
    @Autowired
    @Qualifier("usersService")
    UserService userService;
    
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
    
    @RequestMapping(value = "/rest/statistique",method = RequestMethod.POST)
    public void createStat(@RequestBody Statistique stat){
        System.out.println("HHHHHHHHHHHHHHHHHHH  :: "+stat);
        statistiqueService.add(stat);
    }
}

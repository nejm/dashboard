package com.smi.controller;

import com.smi.service.StatistiqueService;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class HelloController {
    
    @Autowired
    @Qualifier("statService")
    StatistiqueService statistiqueService;
    
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ModelAndView welcomePage(Principal principal) {
        ModelAndView model = new ModelAndView();
        model.setViewName("login");
        return model;
    }
    
    @RequestMapping(value = "/home", method = RequestMethod.GET)
    public ModelAndView homePage(Principal principal) {
        ModelAndView model = new ModelAndView();
        model.addObject("user",principal.getName().toString().toUpperCase());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        model.addObject("roles",authentication.getAuthorities());
        model.setViewName("home");
        return model;
    }
    
    @RequestMapping(value = "/new", method = RequestMethod.GET)
    public ModelAndView newPage(Principal principal) {
        ModelAndView model = new ModelAndView();
        model.addObject("user",principal.getName().toUpperCase());
        model.addObject("id",0);
        model.setViewName("new_1");
        return model;
    }
    
    @RequestMapping(value = "/edit/{id}", method = RequestMethod.GET)
    public ModelAndView editPage(@PathVariable("id") long id, Principal principal) {
        ModelAndView model = new ModelAndView();
        model.addObject("user",principal.getName().toUpperCase());
        model.addObject("id",id);
        model.setViewName("new_1");
        return model;
    }
    
    @RequestMapping(value = "/users", method = RequestMethod.GET)
    public ModelAndView usersPage(Principal principal) {
        ModelAndView model = new ModelAndView();
        model.setViewName("users");
        return model;
    }
    
    @RequestMapping(value = "/home/{id}", method = RequestMethod.GET)
    public ModelAndView statPage(@PathVariable("id") long id, Principal principal) {
        ModelAndView model = new ModelAndView();
        model.addObject("user",principal.getName().toString().toUpperCase());
        model.addObject("id",id);
        model.setViewName("stat");
        return model;
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public ModelAndView login(@RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "logout", required = false) String logout, Principal principal) {

        ModelAndView model = new ModelAndView();
        //if(principal != null) 
        
       
        if (error != null) {
            model.addObject("error", "Invalid username and password!");
        }

        if (logout != null) {
            model.addObject("msg", "You've been logged out successfully.");
        }
        
        if(error == null && logout== null && principal!=null)
            return new ModelAndView("redirect:/home");
        model.setViewName("login");
        return model;

    }

}

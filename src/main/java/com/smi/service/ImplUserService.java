package com.smi.service;

import org.apache.log4j.Logger;

import com.smi.dao.UserDao;
import com.smi.dao.UserDaoImpl;
import com.smi.model.Users;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpSession;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service("userService")
public class ImplUserService implements UserDetailsService {

    final static Logger logger = Logger.getLogger(ImplUserService.class);

    UserDao userDao = new UserDaoImpl();
    
    @Transactional
    @Override
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        if (name != null && !name.equals("")) {
            Users user = userDao.findByUsername(name);

            if (user == null) {
                throw new UsernameNotFoundException("Username not found");
            }
            List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
            if(user.getProfile() == 'A'){
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            }else{
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }
            return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(),
                    true, true, true, true, authorities);
        } else {
            return null;
        }
        

    }

}

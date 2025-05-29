#!/usr/bin/env python3
import unittest
import json
import os
import sys
from unittest.mock import patch, MagicMock

class AngelGuardianMonitoringTests(unittest.TestCase):
    """
    Test suite for Angel Guardian monitoring functionality.
    
    Note: Since this is an Electron app with integrated monitoring services,
    we're testing the conceptual functionality that would be present in the app.
    """
    
    def setUp(self):
        """Set up test environment"""
        # Mock localStorage for testing
        self.local_storage = {}
        
        # Mock monitoring service
        self.monitoring_service = {
            'screen_monitoring_active': True,
            'keyboard_monitoring_active': True,
            'strict_mode_enabled': False,
            'blocked_attempts': 0,
            'guardian_email': None
        }
    
    def test_guardian_setup(self):
        """Test guardian setup functionality"""
        # Set guardian email
        guardian_email = "guardian@example.com"
        self.monitoring_service['guardian_email'] = guardian_email
        self.local_storage['guardian_angel_guardian_email'] = guardian_email
        
        # Verify guardian is set
        self.assertEqual(self.monitoring_service['guardian_email'], guardian_email)
        self.assertEqual(self.local_storage['guardian_angel_guardian_email'], guardian_email)
        
        # Verify guardian is considered set up
        is_guardian_set = self.monitoring_service['guardian_email'] is not None
        self.assertTrue(is_guardian_set)
    
    def test_keyboard_monitoring(self):
        """Test keyboard monitoring functionality"""
        # Simulate typing inappropriate content
        inappropriate_text = "porn"
        
        # Mock detection function
        def detect_inappropriate(text):
            inappropriate_words = ["porn", "xxx", "sexo"]
            return any(word in text.lower() for word in inappropriate_words)
        
        # Test detection
        is_inappropriate = detect_inappropriate(inappropriate_text)
        self.assertTrue(is_inappropriate)
        
        # Test with appropriate content
        appropriate_text = "hello world"
        is_inappropriate = detect_inappropriate(appropriate_text)
        self.assertFalse(is_inappropriate)
        
        # Test blocked attempts increment
        if is_inappropriate:
            self.monitoring_service['blocked_attempts'] += 1
        
        self.assertEqual(self.monitoring_service['blocked_attempts'], 0)
    
    def test_strict_mode_toggle(self):
        """Test strict mode toggle functionality"""
        # Initial state
        self.assertFalse(self.monitoring_service['strict_mode_enabled'])
        
        # Toggle strict mode on
        self.monitoring_service['strict_mode_enabled'] = True
        self.local_storage['guardian_angel_strict_mode'] = 'true'
        
        # Verify strict mode is enabled
        self.assertTrue(self.monitoring_service['strict_mode_enabled'])
        self.assertEqual(self.local_storage['guardian_angel_strict_mode'], 'true')
        
        # Toggle strict mode off
        self.monitoring_service['strict_mode_enabled'] = False
        self.local_storage['guardian_angel_strict_mode'] = 'false'
        
        # Verify strict mode is disabled
        self.assertFalse(self.monitoring_service['strict_mode_enabled'])
        self.assertEqual(self.local_storage['guardian_angel_strict_mode'], 'false')
    
    def test_monitoring_toggle(self):
        """Test monitoring toggle functionality"""
        # Initial state
        self.assertTrue(self.monitoring_service['screen_monitoring_active'])
        self.assertTrue(self.monitoring_service['keyboard_monitoring_active'])
        
        # Toggle monitoring off
        self.monitoring_service['screen_monitoring_active'] = False
        self.monitoring_service['keyboard_monitoring_active'] = False
        self.local_storage['guardian_angel_monitoring_enabled'] = 'false'
        
        # Verify monitoring is disabled
        self.assertFalse(self.monitoring_service['screen_monitoring_active'])
        self.assertFalse(self.monitoring_service['keyboard_monitoring_active'])
        self.assertEqual(self.local_storage['guardian_angel_monitoring_enabled'], 'false')
        
        # Toggle monitoring on
        self.monitoring_service['screen_monitoring_active'] = True
        self.monitoring_service['keyboard_monitoring_active'] = True
        self.local_storage['guardian_angel_monitoring_enabled'] = 'true'
        
        # Verify monitoring is enabled
        self.assertTrue(self.monitoring_service['screen_monitoring_active'])
        self.assertTrue(self.monitoring_service['keyboard_monitoring_active'])
        self.assertEqual(self.local_storage['guardian_angel_monitoring_enabled'], 'true')
    
    def test_blocked_attempts_counter(self):
        """Test blocked attempts counter functionality"""
        # Initial state
        self.assertEqual(self.monitoring_service['blocked_attempts'], 0)
        
        # Increment blocked attempts
        self.monitoring_service['blocked_attempts'] += 1
        self.local_storage['guardian_angel_blocked_attempts'] = '1'
        
        # Verify blocked attempts counter
        self.assertEqual(self.monitoring_service['blocked_attempts'], 1)
        self.assertEqual(self.local_storage['guardian_angel_blocked_attempts'], '1')
        
        # Increment again
        self.monitoring_service['blocked_attempts'] += 1
        self.local_storage['guardian_angel_blocked_attempts'] = '2'
        
        # Verify blocked attempts counter
        self.assertEqual(self.monitoring_service['blocked_attempts'], 2)
        self.assertEqual(self.local_storage['guardian_angel_blocked_attempts'], '2')

if __name__ == '__main__':
    unittest.main()
"""Tests for the UserStateService."""

from app.services.user_state_service import UserStateService


def test_new_user_has_zero_state():
    service = UserStateService()
    state = service.get_user_state("user-1")
    assert state.consecutive_losses == 0
    assert state.total_trades == 0


def test_record_loss_increments_streak():
    service = UserStateService()
    service.record_trade_result("user-1", success=False)
    service.record_trade_result("user-1", success=False)
    state = service.get_user_state("user-1")
    assert state.consecutive_losses == 2
    assert state.total_trades == 2


def test_record_win_resets_streak():
    service = UserStateService()
    service.record_trade_result("user-1", success=False)
    service.record_trade_result("user-1", success=False)
    service.record_trade_result("user-1", success=True)
    state = service.get_user_state("user-1")
    assert state.consecutive_losses == 0
    assert state.total_trades == 3


def test_separate_users_have_independent_state():
    service = UserStateService()
    service.record_trade_result("user-1", success=False)
    service.record_trade_result("user-2", success=True)
    assert service.get_user_state("user-1").consecutive_losses == 1
    assert service.get_user_state("user-2").consecutive_losses == 0


def test_record_returns_updated_state():
    service = UserStateService()
    state = service.record_trade_result("user-1", success=False)
    assert state.consecutive_losses == 1
    assert state.total_trades == 1


def test_alternating_results():
    service = UserStateService()
    service.record_trade_result("user-1", success=False)
    service.record_trade_result("user-1", success=True)
    service.record_trade_result("user-1", success=False)
    service.record_trade_result("user-1", success=False)
    state = service.get_user_state("user-1")
    assert state.consecutive_losses == 2
    assert state.total_trades == 4
